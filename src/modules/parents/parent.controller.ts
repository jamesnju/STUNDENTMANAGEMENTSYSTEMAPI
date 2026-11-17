import { Request, Response } from 'express';
import { requireUser } from '../../shared/utils/requireUser';
import { parentService } from './parent.service';

export const parentController = {
  async me(req: Request, res: Response) {
    const user = requireUser(req);
    res.json({ success: true, data: await parentService.me(user.id) });
  },
  async children(req: Request, res: Response) {
    const user = requireUser(req);
    res.json({ success: true, data: await parentService.children(user.id) });
  },
  async childTimetable(req: Request, res: Response) {
    const user = requireUser(req);
    const { studentId } = req.validatedParams as { studentId: string };
    res.json({ success: true, data: await parentService.childTimetable(user.id, studentId) });
  },
  async childNotes(req: Request, res: Response) {
    const user = requireUser(req);
    const { studentId } = req.validatedParams as { studentId: string };
    const q = req.validatedQuery as { skip: number; take: number; page: number; limit: number };
    const { items, total } = await parentService.childNotes(user.id, studentId, q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },
  async childAssignments(req: Request, res: Response) {
    const user = requireUser(req);
    const { studentId } = req.validatedParams as { studentId: string };
    const q = req.validatedQuery as { skip: number; take: number; page: number; limit: number };
    const { items, total } = await parentService.childAssignments(user.id, studentId, q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },
};