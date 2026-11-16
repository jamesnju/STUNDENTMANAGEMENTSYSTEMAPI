import { Request, Response } from 'express';
import { classService } from './class.service';

export const classController = {
  async create(req: Request, res: Response) {
    res.status(201).json({ success: true, data: await classService.create(req.body) });
  },
  async list(req: Request, res: Response) {
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      search?: string;
      departmentId?: string;
      academicYear?: string;
      isActive?: boolean;
    };
    const { items, total } = await classService.list(q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },
  async get(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await classService.getById(id) });
  },
  async update(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await classService.update(id, req.body) });
  },
  async remove(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await classService.remove(id) });
  },
};