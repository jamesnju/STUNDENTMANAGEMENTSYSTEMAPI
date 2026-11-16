import { Request, Response } from 'express';
import { roomService } from './room.service';

export const roomController = {
  async create(req: Request, res: Response) {
    res.status(201).json({ success: true, data: await roomService.create(req.body) });
  },
  async list(req: Request, res: Response) {
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      search?: string;
      building?: string;
      isActive?: boolean;
    };
    const { items, total } = await roomService.list(q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },
  async get(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await roomService.getById(id) });
  },
  async update(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await roomService.update(id, req.body) });
  },
  async remove(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await roomService.remove(id) });
  },
};