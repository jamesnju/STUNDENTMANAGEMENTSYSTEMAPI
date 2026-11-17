import { Request, Response } from 'express';
import { requireUser } from '../../shared/utils/requireUser';
import { noteService } from './note.service';

export const noteController = {
  async create(req: Request, res: Response) {
    const user = requireUser(req);
    const note = await noteService.create(user as never, req.body);
    res.status(201).json({ success: true, data: note });
  },

  async list(req: Request, res: Response) {
    const user = requireUser(req);
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      classId?: string;
      subjectId?: string;
      teacherId?: string;
      published?: boolean;
      search?: string;
    };
    const { items, total } = await noteService.list(user as never, q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },

  async get(req: Request, res: Response) {
    const user = requireUser(req);
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await noteService.getById(user as never, id) });
  },

  async update(req: Request, res: Response) {
    const user = requireUser(req);
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await noteService.update(user as never, id, req.body) });
  },

  async publish(req: Request, res: Response) {
    const user = requireUser(req);
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await noteService.publish(user as never, id) });
  },

  async remove(req: Request, res: Response) {
    const user = requireUser(req);
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await noteService.remove(user as never, id) });
  },
};