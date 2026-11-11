import { Request, Response } from 'express';
import { jobRegistry, type JobName } from './runners';
import { NotFound } from '../../shared/errors/httpErrors';
import { requireUser } from '../../shared/utils/requireUser';

export const jobsController = {
  async list(_req: Request, res: Response) {
    res.json({
      success: true,
      data: Object.keys(jobRegistry),
    });
  },

  async run(req: Request, res: Response) {
    const { jobName } = req.validatedParams as { jobName: JobName };
    const runner = jobRegistry[jobName];
    if (!runner) throw NotFound(`Unknown job: ${jobName}`);

    const user = requireUser(req);
    const input = { ...(req.body ?? {}), __triggeredBy: user.id };

    const startedAt = Date.now();
    const result = await runner(input);
    res.json({
      success: true,
      data: {
        jobName,
        durationMs: Date.now() - startedAt,
        triggeredBy: user.id,
        result,
      },
    });
  },

  async history(req: Request, res: Response) {
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
    };
    const { prisma } = await import('../../config/database.js');
    const [items, total] = await Promise.all([
      prisma.jobRun.findMany({
        orderBy: { createdAt: 'desc' },
        skip: q.skip,
        take: q.take,
      }),
      prisma.jobRun.count(),
    ]);
    res.json({
      success: true,
      data: items,
      meta: { page: q.page, limit: q.limit, total },
    });
  },
};