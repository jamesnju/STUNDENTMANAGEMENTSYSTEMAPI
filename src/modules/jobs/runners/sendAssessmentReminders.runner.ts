import { prisma } from '../../../config/database';
import { JobResult } from '../../../types/runners/types';
import { notificationService } from '../../notifications/notification.service';

type Input = {
  /** Remind assessments opening within this many hours (default 24). */
  windowHours?: number;
};

export const sendAssessmentRemindersRunner = async (
  input?: Input,
): Promise<JobResult> => {
  const windowHours = input?.windowHours ?? 24;
  const now = new Date();
  const until = new Date(now.getTime() + windowHours * 3600_000);

  // Reminders are system-generated: attribute to an admin user.
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN', isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (!admin) {
    return {
      ok: false,
      summary: { error: 'No active ADMIN user to author reminder notifications' },
    };
  }

  const assessments = await prisma.assessment.findMany({
    where: {
      deletedAt: null,
      status: { in: ['SCHEDULED', 'PUBLISHED'] },
      opensAt: { gte: now, lte: until },
    },
    include: {
      class: { select: { id: true, name: true, code: true } },
      subject: { select: { id: true, name: true } },
    },
    take: 200,
  });

  let remindersCreated = 0;
  let skippedAlreadySent = 0;
  let skippedNoRecipients = 0;
  let failed = 0;

  for (const a of assessments) {
    const marker = `[reminder:assessment:${a.id}]`;

    const existing = await prisma.notification.findFirst({
      where: {
        title: { startsWith: marker },
        createdAt: { gte: new Date(now.getTime() - 36 * 3600_000) },
      },
      select: { id: true },
    });
    if (existing) {
      skippedAlreadySent++;
      continue;
    }

    const enrolledCount = await prisma.classEnrollment.count({
      where: { classId: a.classId, isActive: true },
    });
    if (enrolledCount === 0) {
      skippedNoRecipients++;
      continue;
    }

    const opensAtStr = a.opensAt!.toUTCString();

    try {
      await notificationService.create({
        title: `${marker} ${a.subject.name} ${a.type} opens soon`,
        body:
          `Reminder: your ${a.subject.name} ${a.type.toLowerCase()} for ${a.class.name} ` +
          `opens on ${opensAtStr}. Please be prepared.`,
        audience: 'CLASS',
        classId: a.classId,
        channels: ['EMAIL', 'IN_APP'],
        scheduledFor: null,
        createdById: admin.id,
      });
      remindersCreated++;
    } catch {
      failed++;
    }
  }

  return {
    ok: failed === 0,
    summary: {
      windowHours,
      assessmentsScanned: assessments.length,
      remindersCreated,
      skippedAlreadySent,
      skippedNoRecipients,
      failed,
    },
  };
};