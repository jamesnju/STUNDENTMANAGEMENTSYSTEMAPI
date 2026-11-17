import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';

export const createAssignmentSchema = z.object({
  title: z.string().min(2).max(200),
  instructions: z.string().max(10_000).optional(),
  classId: z.string().cuid(),
  subjectId: z.string().cuid(),
  termId: z.string().cuid(),
  dueAt: z.coerce.date().nullable().optional(),
  fileIds: z.array(z.string().cuid()).max(20).optional(),
  isPublished: z.boolean().optional(),
});

export const updateAssignmentSchema = z
  .object({
    title: z.string().min(2).max(200).optional(),
    instructions: z.string().max(10_000).nullable().optional(),
    dueAt: z.coerce.date().nullable().optional(),
    fileIds: z.array(z.string().cuid()).max(20).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'At least one field is required',
  });

export const listAssignmentsSchema = paginationSchema.extend({
  classId: z.string().cuid().optional(),
  subjectId: z.string().cuid().optional(),
  termId: z.string().cuid().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
  search: z.string().optional(),
});
export const addFileSchema = z.object({ fileId: z.string().cuid() });
export const fileIdParamSchema = z.object({
  id: z.string().cuid(),
  fileId: z.string().cuid(),
});
export const idParamSchema = z.object({ id: z.string().cuid() });