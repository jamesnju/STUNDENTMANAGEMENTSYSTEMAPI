import { z } from 'zod';

export const jobNameParamSchema = z.object({
  jobName: z.enum([
    'sendPendingNotifications',
    'sendAssessmentReminders',
    'markOverdueAssignments',
    'generateDailyDigest',
    'cleanupExpiredRefreshTokens',
  ]),
});

export const runJobBodySchema = z.object({
  limit: z.number().int().min(1).max(500).optional(),
  recipientLimit: z.number().int().min(1).max(5000).optional(),
  windowHours: z.number().int().min(1).max(168).optional(),
  asOf: z.string().datetime().optional(),
  forDate: z.string().datetime().optional(),
  revokedRetentionDays: z.number().int().min(1).max(365).optional(),
  maxDeletes: z.number().int().min(1).max(50_000).optional(),
});