import { Request, Response } from 'express';
import { teacherService } from './teacher.service';
import { requireUser } from '../../shared/utils/requireUser';

export const teacherController = {
  async me(req: Request, res: Response) {
    const user = requireUser(req);
    const teacher = await teacherService.me(user.id);
    res.json({ success: true, data: teacher });
  },

  async myClasses(req: Request, res: Response) {
    const user = requireUser(req);
    const classes = await teacherService.myClasses(user.id);
    res.json({ success: true, data: classes });
  },

  async myStudents(req: Request, res: Response) {
    const user = requireUser(req);
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      search?: string;
    };
    const { items, total } = await teacherService.myStudents(user.id, q);
    res.json({
      success: true,
      data: items,
      meta: { page: q.page, limit: q.limit, total },
    });
  },

  async myStudentById(req: Request, res: Response) {
    const user = requireUser(req);
    const { studentId } = req.validatedParams as { studentId: string };
    const student = await teacherService.myStudentById(user.id, studentId);
    res.json({ success: true, data: student });
  },
};