import { z } from 'zod';
import { paginationSchema } from '../../../shared/utils/pagination';

export const enrollSchema = z.object({
  classId: z.string().cuid(),
  studentId: z.string().cuid(),
  term: z.string().min(2).max(50),
});

export const bulkEnrollSchema = z.object({
  classId: z.string().cuid(),
  term: z.string().min(2).max(50),
  studentIds: z.array(z.string().cuid()).min(1).max(500),
});

export const listEnrollmentsSchema = paginationSchema.extend({
  classId: z.string().cuid().optional(),
  studentId: z.string().cuid().optional(),
  term: z.string().optional(),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });