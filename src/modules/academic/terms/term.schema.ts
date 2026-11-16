import { z } from 'zod';
import { paginationSchema } from '../../../shared/utils/pagination';

export const createTermSchema = z
  .object({
    name: z.string().min(2).max(50),
    academicYear: z.string().min(4).max(9),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => d.endsAt > d.startsAt, {
    message: 'endsAt must be after startsAt',
    path: ['endsAt'],
  });

export const updateTermSchema = z
  .object({
    name: z.string().min(2).max(50).optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'At least one field is required',
  });

export const listTermsSchema = paginationSchema.extend({
  academicYear: z.string().optional(),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });