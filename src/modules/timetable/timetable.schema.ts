import { z } from 'zod';
import { paginationSchema } from '../../shared/utils/pagination';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createSlotSchema = z
  .object({
    classId: z.string().cuid(),
    subjectId: z.string().cuid(),
    teacherId: z.string().cuid(),
    studentId: z.string().cuid().nullable().optional(),
    dayOfWeek: z.number().int().min(1).max(5),
    period: z.number().int().min(1).max(8),
    startTime: z.string().regex(timeRegex, 'HH:MM'),
    endTime: z.string().regex(timeRegex, 'HH:MM'),
    room: z.string().max(20).optional(),
    roomId: z.string().cuid().nullable().optional(),
  })
  .refine((d) => d.startTime < d.endTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

export const updateSlotSchema = z
  .object({
    subjectId: z.string().cuid().optional(),
    teacherId: z.string().cuid().optional(),
    studentId: z.string().cuid().nullable().optional(),
    dayOfWeek: z.number().int().min(1).max(5).optional(),
    period: z.number().int().min(1).max(8).optional(),
    startTime: z.string().regex(timeRegex).optional(),
    endTime: z.string().regex(timeRegex).optional(),
    roomId: z.string().cuid().nullable().optional(),
    room: z.string().max(20).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'At least one field is required',
  });

export const listSlotsSchema = paginationSchema.extend({
  classId: z.string().cuid().optional(),
  teacherId: z.string().cuid().optional(),
  subjectId: z.string().cuid().optional(),
  studentId: z.string().cuid().optional(),
  roomId: z.string().cuid().optional(),
  dayOfWeek: z.coerce.number().int().min(1).max(5).optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });