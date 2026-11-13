import { z } from 'zod';
import { Audience, NotificationChannel } from '@prisma/client';
import { paginationSchema } from '../../shared/utils/pagination';

export const createNotificationSchema = z.object({
  title: z.string().min(2).max(200),
  body: z.string().min(1).max(10_000),
  audience: z.nativeEnum(Audience),
  classId: z.string().cuid().optional(),
  channels: z
    .array(z.nativeEnum(NotificationChannel))
    .min(1)
    .max(2)
    .default(['EMAIL', 'IN_APP']),
  scheduledFor: z.coerce.date().nullable().optional(),
});

export const listNotificationsSchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'SENT', 'FAILED']).optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });

export const markReadSchema = z.object({
  /** Optional — mark read only these recipient rows (default: all for user) */
  recipientIds: z.array(z.string().cuid()).optional(),
});