import { prisma } from '../../../config/database';
import { logger } from '../../../config/logger';
import { JobResult } from '../../../types/runners/types';

type Input = {
  /** Optional cutoff override (default: now). ISO string. */
  asOf?: string;
  /** Max assignments to flip in one run (Vercel safety cap). */
  limit?: number;
};

/**
 * Flips PUBLISHED assignments whose dueAt has passed to CLOSED.
 *
 * Why a job instead of a computed field:
 *  - Lets listing endpoints filter by `status = CLOSED` directly, avoiding
 *    `OR [status=PUBLISHED, dueAt < now]` predicates scattered everywhere.
 *  - Gives a deterministic audit point (`JobRun`) for when the state changed.
 *
 * Safe to run repeatedly: it only touches rows where status = PUBLISHED
 * AND dueAt <= asOf AND deletedAt IS NULL. Running again matches nothing.
 */
export const markOverdueAssignmentsRunner = async (
  input?: Input,
): Promise<JobResult> => {
  const asOf = input?.asOf ? new Date(input.asOf) : new Date();
  if (Number.isNaN(asOf.getTime())) {
    throw new Error(`markOverdueAssignments: invalid asOf "${input?.asOf}"`);
  }

  const limit = input?.limit ?? 1000;

  // Snapshot candidates first so we can report exactly what we closed.
  const candidates = await prisma.assignment.findMany({
    where: {
      deletedAt: null,
      status: 'PUBLISHED',
      dueAt: { not: null, lte: asOf },
    },
    select: { id: true, title: true, dueAt: true, classId: true },
    take: limit,
    orderBy: { dueAt: 'asc' },
  });

  if (candidates.length === 0) {
    return {
      ok: true,
      summary: {
        asOf: asOf.toISOString(),
        closed: 0,
        stillPublished: await prisma.assignment.count({
          where: { deletedAt: null, status: 'PUBLISHED' },
        }),
      },
    };
  }

  const ids = candidates.map((c) => c.id);

  const result = await prisma.assignment.updateMany({
    where: {
      id: { in: ids },
      status: 'PUBLISHED', // guard against a concurrent update
    },
    data: { status: 'CLOSED' },
  });

  const stillPublished = await prisma.assignment.count({
    where: { deletedAt: null, status: 'PUBLISHED' },
  });

  logger.info(
    { asOf: asOf.toISOString(), closed: result.count, stillPublished },
    'markOverdueAssignments.done',
  );

  return {
    ok: true,
    summary: {
      asOf: asOf.toISOString(),
      candidatesFound: candidates.length,
      closed: result.count,
      stillPublished,
      limitHit: candidates.length === limit,
    },
  };
};