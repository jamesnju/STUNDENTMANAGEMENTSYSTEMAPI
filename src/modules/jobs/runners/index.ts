import { sendAssessmentRemindersRunner } from './sendAssessmentReminders.runner';
import { generateDailyDigestRunner } from './generateDailyDigest.runner';
import { cleanupExpiredRefreshTokensRunner } from './cleanupExpiredRefreshTokens.runner';
import { markOverdueAssignmentsRunner } from './markOverdueAssignments.runner';
import { sendPendingNotificationsRunner } from './sendPendingNotifications.runner';
import { JobRunner } from '../../../types/runners/types';
import { withAudit } from '../../../types/runners/audit';

export const jobRegistry = {
  sendPendingNotifications: withAudit('sendPendingNotifications', sendPendingNotificationsRunner),
  sendAssessmentReminders: withAudit('sendAssessmentReminders', sendAssessmentRemindersRunner),
  markOverdueAssignments: withAudit('markOverdueAssignments', markOverdueAssignmentsRunner),
  generateDailyDigest: withAudit('generateDailyDigest', generateDailyDigestRunner),
  cleanupExpiredRefreshTokens: withAudit('cleanupExpiredRefreshTokens', cleanupExpiredRefreshTokensRunner),
} satisfies Record<string, JobRunner<any>>;

export type JobName = keyof typeof jobRegistry;