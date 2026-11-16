import { z } from 'zod';
import { paginationSchema } from '../../../shared/utils/pagination';

export const createClassSubjectSchema = z.object({
  classId: z.string().cuid(),
  subjectId: z.string().cuid(),
  teacherId: z.string().cuid(),
});

export const listClassSubjectsSchema = paginationSchema.extend({
  classId: z.string().cuid().optional(),
  subjectId: z.string().cuid().optional(),
  teacherId: z.string().cuid().optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });