import { Request, Response } from 'express';
import { settingsService } from './settings.service';

export const settingsController = {
  async create(req: Request, res: Response) {
    const setting = await settingsService.create(req.body);
    res.status(201).json({ success: true, data: setting });
  },

  async list(req: Request, res: Response) {
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      search?: string;
      sortBy?: string;
      sortDir: 'asc' | 'desc';
    };
    const { items, total } = await settingsService.list(q);
    res.json({
      success: true,
      data: items,
      meta: { page: q.page, limit: q.limit, total },
    });
  },

  async get(req: Request, res: Response) {
    const { param } = req.validatedParams as { param: string };
    const setting = await settingsService.getByParam(param);
    res.json({ success: true, data: setting });
  },

  async update(req: Request, res: Response) {
    const { param } = req.validatedParams as { param: string };
    const setting = await settingsService.update(param, req.body);
    res.json({ success: true, data: setting });
  },

  async remove(req: Request, res: Response) {
    const { param } = req.validatedParams as { param: string };
    const result = await settingsService.remove(param);
    res.json({ success: true, data: result });
  },
};