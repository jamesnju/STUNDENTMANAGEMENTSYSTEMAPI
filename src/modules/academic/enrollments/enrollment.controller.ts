import { Request, Response } from 'express';
import { enrollmentService } from './enrollment.service';

export const enrollmentController = {
  async enroll(req: Request, res: Response) {
    res.status(201).json({ success: true, data: await enrollmentService.enroll(req.body) });
  },
  async bulkEnroll(req: Request, res: Response) {
    res.status(201).json({ success: true, data: await enrollmentService.bulkEnroll(req.body) });
  },
  async list(req: Request, res: Response) {
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      classId?: string;
      studentId?: string;
      term?: string;
      isActive?: boolean;
    };
    const { items, total } = await enrollmentService.list(q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },
  async withdraw(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await enrollmentService.withdraw(id) });
  },
};