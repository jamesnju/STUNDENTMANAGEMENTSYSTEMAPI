import { Request, Response } from 'express';
import { termService } from './term.service';

export const termController = {
  async create(req: Request, res: Response) {
    const term = await termService.create(req.body);
    res.status(201).json({ success: true, data: term });
  },

  async list(req: Request, res: Response) {
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      academicYear?: string;
      isActive?: boolean;
    };
    const { items, total } = await termService.list(q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },

  async get(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    const term = await termService.getById(id);
    res.json({ success: true, data: term });
  },

  async update(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    const term = await termService.update(id, req.body);
    res.json({ success: true, data: term });
  },

  async remove(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    const result = await termService.remove(id);
    res.json({ success: true, data: result });
  },
};