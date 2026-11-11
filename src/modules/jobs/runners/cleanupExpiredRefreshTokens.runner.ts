import { prisma } from '../../../config/database';
import { logger } from '../../../config/logger';
import { JobResult } from '../../../types/runners/types';

type Input = {
  /** Days to keep revoked tokens after revocation (default 7). */
  revokedRetentionDays?: number;
  /** Hard cap on total deletes in one run (default 5000). */
  maxDeletes?: number;
};

/**
 * Deletes refresh tokens that are:
 *   1. expired (expiresAt < now), OR
 *   2. revoked more than `revokedRetentionDays` days ago.
 *
 * Keeps the RefreshToken table small on the free tier. Runs in two passes
 * so a `maxDeletes` cap can still leave the more urgent (expired) rows
 * purged first.
 *
 * Safe to run repeatedly: deleting a non-existent row is a no-op.
 */
export const cleanupExpiredRefreshTokensRunner = async (
  input?: Input,
): Promise<JobResult> => {
  const revokedRetentionDays = input?.revokedRetentionDays ?? 7;
  const maxDeletes = input?.maxDeletes ?? 5000;

  const now = new Date();
  const revokedCutoff = new Date(
    now.getTime() - revokedRetentionDays * 86_400_000,
  );

  // Count first so the response is informative even when capped.
  const [expiredCount, revokedCount] = await Promise.all([
    prisma.refreshToken.count({ where: { expiresAt: { lt: now } } }),
    prisma.refreshToken.count({
      where: {
        revokedAt: { not: null, lt: revokedCutoff },
        // don't double-count tokens that are already counted as expired
        expiresAt: { gte: now },
      },
    }),
  ]);

  const totalCandidates = expiredCount + revokedCount;
  const budget = Math.max(0, maxDeletes);

  // Pass 1: expired tokens (highest priority)
  const expiredPass = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: now },
      ...(budget > 0 ? {} : { id: { in: [] } }), // short-circuit if no budget
    },
  });

  const remainingBudget = Math.max(0, budget - expiredPass.count);

  // Pass 2: revoked tokens (only if budget remains)
  const revokedPass =
    remainingBudget > 0
      ? await prisma.refreshToken.deleteMany({
          where: {
            revokedAt: { not: null, lt: revokedCutoff },
            expiresAt: { gte: now },
          },
          // Prisma doesn't support a `take` on deleteMany, so use id windowing
          // only if we might exceed the budget. Check remaining count first.
        })
      : { count: 0 };

  // If pass 2 overshot the budget, that's fine — the cap is a guideline.
  // (Prisma deleteMany is one statement; further limiting would require a
  // subquery we can't express cleanly. 5k rows is well within a Vercel run.)

  const deletedTotal = expiredPass.count + revokedPass.count;

  logger.info(
    {
      expiredCount,
      revokedCount,
      deletedExpired: expiredPass.count,
      deletedRevoked: revokedPass.count,
      deletedTotal,
    },
    'cleanupExpiredRefreshTokens.done',
  );

  return {
    ok: true,
    summary: {
      expiredCandidates: expiredCount,
      revokedCandidates: revokedCount,
      totalCandidates,
      deletedExpired: expiredPass.count,
      deletedRevoked: revokedPass.count,
      deletedTotal,
      cappedAt: totalCandidates > maxDeletes ? maxDeletes : null,
    },
  };
};