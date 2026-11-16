import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';

export const createRoomSchema = z.object({
  name: z.string().min(1).max(50),
  code: z.string().min(1).max(20).optional(),
  capacity: z.number().int().positive().max(1000).optional(),
  building: z.string().max(50).optional(),
  floor: z.number().int().min(-5).max(100).optional(),
  description: z.string().max(255).optional(),
});

export const updateRoomSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
    code: z.string().min(1).max(20).nullable().optional(),
    capacity: z.number().int().positive().max(1000).nullable().optional(),
    building: z.string().max(50).nullable().optional(),
    floor: z.number().int().min(-5).max(100).nullable().optional(),
    description: z.string().max(255).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'At least one field is required',
  });

export const listRoomsSchema = paginationSchema.extend({
  search: z.string().optional(),
  building: z.string().optional(),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });