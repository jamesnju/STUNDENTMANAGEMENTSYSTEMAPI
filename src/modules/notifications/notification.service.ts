import { Audience, NotificationChannel } from '@prisma/client';
import { BadRequest } from '../../shared/errors/httpErrors';
import { prisma } from '../../config/database';

export const notificationService = {
  async create(input: {
    title: string;
    body: string;
    audience: Audience;
    classId?: string;
    channels: NotificationChannel[];
    scheduledFor?: Date | null;
    createdById: string;
    /** When provided, bypasses audience resolution and uses these exact user IDs. */
    recipientUserIds?: string[];
  }) {
    const userIds = input.recipientUserIds?.length
      ? Array.from(new Set(input.recipientUserIds))
      : await resolveAudienceUserIds(input.audience, input.classId);

    if (!userIds.length) throw BadRequest('No recipients matched audience');

    return prisma.notification.create({
      data: {
        title: input.title,
        body: input.body,
        audience: input.audience,
        classId: input.classId ?? null,
        scheduledFor: input.scheduledFor ?? null,
        createdById: input.createdById,
        recipients: {
          createMany: {
            data: userIds.flatMap((userId) =>
              input.channels.map((channel) => ({ userId, channel })),
            ),
          },
        },
      },
      include: { recipients: true },
    });
  },
};

async function resolveAudienceUserIds(
  audience: Audience,
  classId?: string,
): Promise<string[]> {
  switch (audience) {
    case 'STUDENTS':
      return (
        await prisma.user.findMany({
          where: { role: 'STUDENT', isActive: true, deletedAt: null },
          select: { id: true },
        })
      ).map((u) => u.id);

    case 'PARENTS':
      return (
        await prisma.user.findMany({
          where: { role: 'PARENT', isActive: true, deletedAt: null },
          select: { id: true },
        })
      ).map((u) => u.id);

    case 'TEACHERS':
      return (
        await prisma.user.findMany({
          where: { role: 'TEACHER', isActive: true, deletedAt: null },
          select: { id: true },
        })
      ).map((u) => u.id);

    case 'STAFF':
      return (
        await prisma.user.findMany({
          where: { role: 'ADMIN', isActive: true, deletedAt: null },
          select: { id: true },
        })
      ).map((u) => u.id);

    case 'CLASS': {
      if (!classId) throw BadRequest('classId required for CLASS audience');
      const students = await prisma.student.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          enrollments: { some: { classId, isActive: true } },
        },
        select: { userId: true, parent: { select: { userId: true } } },
      });
      return [
        ...new Set(
          students
            .flatMap((s) => [s.userId, s.parent?.userId])
            .filter(Boolean) as string[],
        ),
      ];
    }
  }
}