import { prisma } from '../../../config/database';
import { mailer } from '../../../config/mailer';
import { logger } from '../../../config/logger';
import { JobResult } from '../../../types/runners/types';

type Input = {
  /** Max number of Notification rows to process this invocation. */
  limit?: number;
  /** Max recipients sent per notification (safety valve). */
  recipientLimit?: number;
};

export const sendPendingNotificationsRunner = async (
  input?: Input,
): Promise<JobResult> => {
  const limit = input?.limit ?? 50;
  const recipientLimit = input?.recipientLimit ?? 500;
  const now = new Date();

  const notifications = await prisma.notification.findMany({
    where: {
      status: 'PENDING',
      OR: [{ scheduledFor: null }, { scheduledFor: { lte: now } }],
      recipients: { some: { status: 'PENDING' } },
    },
    orderBy: [{ scheduledFor: 'asc' }, { createdAt: 'asc' }],
    take: limit,
    include: {
      recipients: {
        where: { status: 'PENDING' },
        take: recipientLimit,
        include: { user: { select: { id: true, email: true, isActive: true, deletedAt: true } } },
      },
    },
  });

  let notificationsProcessed = 0;
  let emailsSent = 0;
  let inAppSent = 0;
  let failed = 0;
  let skippedInactive = 0;

  for (const n of notifications) {
    for (const r of n.recipients) {
      if (!r.user.isActive || r.user.deletedAt) {
        await prisma.notificationRecipient.update({
          where: { id: r.id },
          data: { status: 'FAILED', error: 'User inactive or deleted' },
        });
        skippedInactive++;
        failed++;
        continue;
      }

      try {
        if (r.channel === 'EMAIL') {
          const info = await mailer.send({
            to: r.user.email,
            subject: n.title,
            text: n.body,
            html: `<div style="font-family:Arial,sans-serif"><h2>${escapeHtml(
              n.title,
            )}</h2><p>${escapeHtml(n.body).replace(/\n/g, '<br/>')}</p></div>`,
          });

          await prisma.$transaction([
            prisma.notificationRecipient.update({
              where: { id: r.id },
              data: { status: 'SENT', sentAt: new Date() },
            }),
            prisma.emailLog.create({
              data: {
                to: r.user.email,
                subject: n.title,
                provider: process.env.MAIL_PROVIDER ?? 'smtp',
                providerMsgId: (info as { messageId?: string }).messageId ?? null,
                status: 'SENT',
                notificationId: n.id,
              },
            }),
          ]);
          emailsSent++;
        } else {
          // IN_APP: the row exists; mark delivered (read state is separate)
          await prisma.notificationRecipient.update({
            where: { id: r.id },
            data: { status: 'SENT', sentAt: new Date() },
          });
          inAppSent++;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error({ err, recipientId: r.id, notificationId: n.id }, 'notification.send.failed');

        await prisma.notificationRecipient.update({
          where: { id: r.id },
          data: { status: 'FAILED', error: message },
        });

        if (r.channel === 'EMAIL') {
          await prisma.emailLog.create({
            data: {
              to: r.user.email,
              subject: n.title,
              provider: process.env.MAIL_PROVIDER ?? 'smtp',
              status: 'FAILED',
              error: message,
              notificationId: n.id,
            },
          });
        }
        failed++;
      }
    }

    // Flip parent Notification to SENT if nothing pending is left for it
    const remaining = await prisma.notificationRecipient.count({
      where: { notificationId: n.id, status: 'PENDING' },
    });

    if (remaining === 0) {
      const anySent = await prisma.notificationRecipient.count({
        where: { notificationId: n.id, status: 'SENT' },
      });
      await prisma.notification.update({
        where: { id: n.id },
        data: {
          status: anySent > 0 ? 'SENT' : 'FAILED',
          sentAt: anySent > 0 ? new Date() : null,
        },
      });
      notificationsProcessed++;
    }
  }

  return {
    ok: failed === 0,
    summary: {
      notificationsScanned: notifications.length,
      notificationsCompleted: notificationsProcessed,
      emailsSent,
      inAppSent,
      failed,
      skippedInactive,
    },
  };
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}