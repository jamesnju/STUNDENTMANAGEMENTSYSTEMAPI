import { z } from 'zod';
import { paginationSchema } from '../../../shared/utils/pagination';

export const createSubjectSchema = z.object({
  name: z.string().min(2).max(100),
  code: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, digits, _ or -'),
  departmentId: z.string().cuid(),
});

export const updateSubjectSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    code: z
      .string()
      .min(2)
      .max(20)
      .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, digits, _ or -')
      .optional(),
    departmentId: z.string().cuid().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'At least one field is required',
  });

export const listSubjectsSchema = paginationSchema.extend({
  search: z.string().optional(),
  departmentId: z.string().cuid().optional(),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });