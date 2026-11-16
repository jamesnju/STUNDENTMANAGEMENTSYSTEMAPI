import { Request, Response } from 'express';
import { classSubjectService } from './classSubject.service';

export const classSubjectController = {
  async create(req: Request, res: Response) {
    res.status(201).json({ success: true, data: await classSubjectService.create(req.body) });
  },
  async list(req: Request, res: Response) {
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      classId?: string;
      subjectId?: string;
      teacherId?: string;
    };
    const { items, total } = await classSubjectService.list(q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },
  async remove(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await classSubjectService.remove(id) });
  },
};