import { Request, Response } from 'express';
import { userService } from './user.service';

export const userController = {
  async create(req: Request, res: Response) {
    const user = await userService.create(req.body);
    res.status(201).json({ success: true, data: user });
  },
  async list(req: Request, res: Response) {
    const q = (req as any).validatedQuery;
    const { items, total } = await userService.list(q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },
  async archived(req: Request, res: Response) {
    const q = (req as any).validatedQuery;
    const { items, total } = await userService.listArchived(q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },
  async get(req: Request, res: Response) {
    const { id } = (req as any).validatedParams;
    const user = await userService.getById(id);
    res.json({ success: true, data: user });
  },
  async update(req: Request, res: Response) {
    const { id } = (req as any).validatedParams;
    const user = await userService.update(id, req.body);
    res.json({ success: true, data: user });
  },
  async remove(req: Request, res: Response) {
    const { id } = (req as any).validatedParams;
    const result = await userService.softDelete(id);
    res.json({ success: true, data: result });
  },
  async restore(req: Request, res: Response) {
    const { id } = (req as any).validatedParams;
    const result = await userService.restore(id);
    res.json({ success: true, data: result });
  },
};