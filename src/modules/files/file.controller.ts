import { Request, Response } from 'express';
import { FileCategory } from '@prisma/client';
import { BadRequest } from '../../shared/errors/httpErrors';
import { requireUser } from '../../shared/utils/requireUser';
import { fileService } from './file.service';

export const fileController = {
  async sign(req: Request, res: Response) {
    const user = requireUser(req);
    const { category } = req.validatedQuery as { category: FileCategory };
    const data = fileService.signDirectUpload({ category, userId: user.id });
    res.json({ success: true, data });
  },

  async upload(req: Request, res: Response) {
    const user = requireUser(req);
    const { category } = req.body as { category: FileCategory };
    const file = req.file;
    if (!file) throw BadRequest('No file uploaded (field name: "file")');

    const created = await fileService.uploadOne({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      category,
      userId: user.id,
    });
    res.status(201).json({ success: true, data: created });
  },

  async list(req: Request, res: Response) {
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      category?: FileCategory;
      uploadedById?: string;
    };
    const { items, total } = await fileService.list(q);
    res.json({
      success: true,
      data: items,
      meta: { page: q.page, limit: q.limit, total },
    });
  },

  async get(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    const file = await fileService.getById(id);
    res.json({ success: true, data: file });
  },

  async remove(req: Request, res: Response) {
    const user = requireUser(req);
    const { id } = req.validatedParams as { id: string };
    const result = await fileService.remove(id, {
      userId: user.id,
      role: user.role as 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT',
    });
    res.json({ success: true, data: result });
  },
};