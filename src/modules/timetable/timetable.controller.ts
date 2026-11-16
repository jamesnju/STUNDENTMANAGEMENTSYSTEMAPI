import { Request, Response } from 'express';
import { timetableService } from './timetable.service';

export const timetableController = {
  async create(req: Request, res: Response) {
    res.status(201).json({ success: true, data: await timetableService.create(req.body) });
  },
  async list(req: Request, res: Response) {
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      classId?: string;
      teacherId?: string;
      subjectId?: string;
      studentId?: string;
      dayOfWeek?: number;
    };
    const { items, total } = await timetableService.list(q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },
  async get(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await timetableService.getById(id) });
  },
  async update(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await timetableService.update(id, req.body) });
  },
  async remove(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await timetableService.remove(id) });
  },
};