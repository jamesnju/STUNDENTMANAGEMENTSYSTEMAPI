import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import type { JobRunner, JobResult } from './types';

/**
 * Wraps a raw job runner so every execution writes a JobRun audit row.
 * Never swallows errors — the runner's exception still bubbles up to the
 * controller so the caller sees a proper failure response.
 */
export function withAudit<I>(
  jobName: string,
  runner: (input: I | undefined) => Promise<JobResult>,
): JobRunner<I> {
  return async (input) => {
    const startedAt = Date.now();
    let triggeredBy: string | undefined;

    // The runner can't know who triggered it, so callers that need this
    // pass it inside `input` under a reserved key. Controllers strip it.
    if (input && typeof input === 'object' && '__triggeredBy' in input) {
      triggeredBy = (input as { __triggeredBy?: string }).__triggeredBy;
    }

    try {
      const result = await runner(input);
      const durationMs = Date.now() - startedAt;

      await prisma.jobRun.create({
        data: {
          jobName,
          triggeredBy: triggeredBy ?? null,
          status: 'SUCCESS',
          durationMs,
          input: (input ?? null) as never,
          result: (result as unknown) as never,
        },
      });

      logger.info({ jobName, durationMs, summary: result.summary }, 'job.run.success');
      return result;
    } catch (err) {
      const durationMs = Date.now() - startedAt;

      await prisma.jobRun
        .create({
          data: {
            jobName,
            triggeredBy: triggeredBy ?? null,
            status: 'FAILED',
            durationMs,
            input: (input ?? null) as never,
            error: err instanceof Error ? err.message : String(err),
          },
        })
        .catch((auditErr) => {
          // never let audit failure mask the original error
          logger.error({ err: auditErr, jobName }, 'job.run.audit_failed');
        });

      logger.error({ err, jobName, durationMs }, 'job.run.failed');
      throw err;
    }
  };
}