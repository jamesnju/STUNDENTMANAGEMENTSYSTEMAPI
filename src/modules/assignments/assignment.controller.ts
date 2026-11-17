import { Request, Response } from 'express';
import { requireUser } from '../../shared/utils/requireUser';
import { assignmentService } from './assignment.service';

export const assignmentController = {
  async create(req: Request, res: Response) {
    const user = requireUser(req);
    res.status(201).json({ success: true, data: await assignmentService.create(user as never, req.body) });
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
      termId?: string;
      status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
      search?: string;
    };
    const { items, total } = await assignmentService.list(user as never, q);
    res.json({ success: true, data: items, meta: { page: q.page, limit: q.limit, total } });
  },
  async get(req: Request, res: Response) {
    const user = requireUser(req);
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await assignmentService.getById(user as never, id) });
  },
  async update(req: Request, res: Response) {
    const user = requireUser(req);
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await assignmentService.update(user as never, id, req.body) });
  },
  async publish(req: Request, res: Response) {
    const user = requireUser(req);
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await assignmentService.publish(user as never, id) });
  },
  async close(req: Request, res: Response) {
    const user = requireUser(req);
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await assignmentService.close(user as never, id) });
  },
  async remove(req: Request, res: Response) {
    const user = requireUser(req);
    const { id } = req.validatedParams as { id: string };
    res.json({ success: true, data: await assignmentService.remove(user as never, id) });
  },
  async addFile(req: Request, res: Response) {
  const user = requireUser(req);
  const { id } = req.validatedParams as { id: string };
  const { fileId } = req.body as { fileId: string };
  res.json({ success: true, data: await assignmentService.addFile(user as never, id, fileId) });
},

async removeFile(req: Request, res: Response) {
  const user = requireUser(req);
  const { id, fileId } = req.validatedParams as { id: string; fileId: string };
  res.json({ success: true, data: await assignmentService.removeFile(user as never, id, fileId) });
},
};