import { Request, Response } from 'express';
import { studentService } from './student.service';
import { requireUser } from '../../shared/utils/requireUser';

export const studentController = {
  async me(req: Request, res: Response) {
    const user = requireUser(req);
    const student = await studentService.me(user.id);
    res.json({ success: true, data: student });
  },

  async myClasses(req: Request, res: Response) {
    const user = requireUser(req);
    const classes = await studentService.myClasses(user.id);
    res.json({ success: true, data: classes });
  },

  async myTimetable(req: Request, res: Response) {
    const user = requireUser(req);
    const timetable = await studentService.myTimetable(user.id);
    res.json({ success: true, data: timetable });
  },

  async myClassmates(req: Request, res: Response) {
    const user = requireUser(req);
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
    };
    const { items } = await studentService.myClassmates(user.id, q);
    res.json({
      success: true,
      data: items,
      meta: { page: q.page, limit: q.limit },
    });
  },
  async myNotes(req: Request, res: Response) {
  const user = requireUser(req);
  const q = req.validatedQuery as { skip: number; take: number; page: number; limit: number };
  const { items, total } = await studentService.myNotes(user.id, q);
  res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
},

async myAssignments(req: Request, res: Response) {
  const user = requireUser(req);
  const q = req.validatedQuery as {
    skip: number; take: number; page: number; limit: number;
    status?: 'PUBLISHED' | 'CLOSED';
  };
  const { items, total } = await studentService.myAssignments(user.id, q);
  res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
},
};