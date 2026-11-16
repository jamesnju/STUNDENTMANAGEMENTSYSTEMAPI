import { Request, Response } from 'express';
import { subjectService } from './subject.service';

export const subjectController = {
  async create(req: Request, res: Response) {
    const subject = await subjectService.create(req.body);
    res.status(201).json({ success: true, data: subject });
  },
  async list(req: Request, res: Response) {
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      search?: string;
      departmentId?: string;
      isActive?: boolean;
    };
    const { items, total } = await subjectService.list(q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },
  async get(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await subjectService.getById(id) });
  },
  async update(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await subjectService.update(id, req.body) });
  },
  async remove(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await subjectService.remove(id) });
  },
};