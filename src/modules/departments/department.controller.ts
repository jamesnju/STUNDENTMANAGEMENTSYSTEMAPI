import { Request, Response } from 'express';
import { departmentService } from './department.service';

export const departmentController = {
  async create(req: Request, res: Response) {
    const dept = await departmentService.create(req.body);
    res.status(201).json({ success: true, data: dept });
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
    const { items, total } = await departmentService.list(q);
    res.json({
      success: true,
      data: items,
      meta: { page: q.page, limit: q.limit, total },
    });
  },

  async get(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    const dept = await departmentService.getById(id);
    res.json({ success: true, data: dept });
  },

  async update(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    const dept = await departmentService.update(id, req.body);
    res.json({ success: true, data: dept });
  },

  async remove(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    const result = await departmentService.remove(id);
    res.json({ success: true, data: result });
  },

  async members(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      role?: 'TEACHER' | 'STUDENT';
    };
    const result = await departmentService.listMembers(id, q);
    res.json({
      success: true,
      data: result,
      meta: {
        page: q.page,
        limit: q.limit,
        totalTeachers: result.teacherTotal,
        totalStudents: result.studentTotal,
      },
    });
  },
};