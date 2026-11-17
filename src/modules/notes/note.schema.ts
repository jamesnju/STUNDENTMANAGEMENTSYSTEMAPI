import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';

export const createNoteSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  classId: z.string().cuid().optional(),
  subjectId: z.string().cuid().optional(),
  fileIds: z.array(z.string().cuid()).max(20).optional(),
  isPublished: z.boolean().optional(),
});

export const updateNoteSchema = z
  .object({
    title: z.string().min(2).max(200).optional(),
    description: z.string().max(5000).nullable().optional(),
    classId: z.string().cuid().nullable().optional(),
    subjectId: z.string().cuid().nullable().optional(),
    fileIds: z.array(z.string().cuid()).max(20).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'At least one field is required',
  });

export const listNotesSchema = paginationSchema.extend({
  classId: z.string().cuid().optional(),
  subjectId: z.string().cuid().optional(),
  teacherId: z.string().cuid().optional(),
  published: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
  search: z.string().optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });