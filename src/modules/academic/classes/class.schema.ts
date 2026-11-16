import { z } from 'zod';
import { paginationSchema } from '../../../shared/utils/pagination';

export const createClassSchema = z.object({
  name: z.string().min(2).max(50),
  code: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, digits, _ or -'),
  academicYear: z.string().min(4).max(9),
  departmentId: z.string().cuid(),
  classTeacherId: z.string().cuid().nullable().optional(),
});

export const updateClassSchema = z
  .object({
    name: z.string().min(2).max(50).optional(),
    code: z
      .string()
      .min(2)
      .max(20)
      .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, digits, _ or -')
      .optional(),
    classTeacherId: z.string().cuid().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'At least one field is required',
  });

export const listClassesSchema = paginationSchema.extend({
  search: z.string().optional(),
  departmentId: z.string().cuid().optional(),
  academicYear: z.string().optional(),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });