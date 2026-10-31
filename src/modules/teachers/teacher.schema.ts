import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';

export const listStudentsSchema = paginationSchema.extend({
  search: z.string().optional(),
});

export const studentIdParamSchema = z.object({
  studentId: z.string().cuid(),
});