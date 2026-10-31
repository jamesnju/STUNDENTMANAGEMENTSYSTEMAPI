import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 chars').max(100),
  code: z
    .string()
    .min(2, 'Code must be at least 2 chars')
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, digits, _ or -'),
});

export const updateDepartmentSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    code: z
      .string()
      .min(2)
      .max(20)
      .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, digits, _ or -')
      .optional(),
  })
  .refine((d) => d.name !== undefined || d.code !== undefined, {
    message: 'At least one field is required',
  });

export const listDepartmentsSchema = paginationSchema.extend({
  search: z.string().optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });