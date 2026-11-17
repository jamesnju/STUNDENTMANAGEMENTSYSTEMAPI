import { Request, Response } from 'express';
import { requireUser } from '../../../shared/utils/requireUser';
import { submissionService } from './submission.service';

export const submissionController = {
  async submit(req: Request, res: Response) {
    const user = requireUser(req);
    const { assignmentId } = req.validatedParams as { assignmentId: string };
    res.status(201).json({
      success: true,
      data: await submissionService.submit(user as never, assignmentId, req.body),
    });
  },

  async listForAssignment(req: Request, res: Response) {
    const user = requireUser(req);
    const { assignmentId } = req.validatedParams as { assignmentId: string };
    const q = req.validatedQuery as { skip: number; take: number; page: number; limit: number; status?: 'ungraded' | 'graded' };
    const { items, total } = await submissionService.listForAssignment(user as never, assignmentId, q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },

  async getOne(req: Request, res: Response) {
    const user = requireUser(req);
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await submissionService.getById(user as never, id) });
  },

  async getMine(req: Request, res: Response) {
    const user = requireUser(req);
    const { assignmentId } = req.validatedParams as { assignmentId: string };
    res.json({ success: true, data: await submissionService.getMine(user as never, assignmentId) });
  },

  async grade(req: Request, res: Response) {
    const user = requireUser(req);
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await submissionService.grade(user as never, id, req.body) });
  },
};