import { Request, Response } from 'express';
import { NotificationStatus, NotificationChannel } from '@prisma/client';
import { prisma } from '../../config/database';
import { requireUser } from '../../shared/utils/requireUser';
import { BadRequest, Forbidden, NotFound } from '../../shared/errors/httpErrors';
import { notificationService } from './notification.service';

export const notificationController = {
  async create(req: Request, res: Response) {
    const user = requireUser(req);
    const body = req.body as {
      title: string;
      body: string;
      audience:
        | 'STUDENTS'
        | 'PARENTS'
        | 'TEACHERS'
        | 'STAFF'
        | 'CLASS';
      classId?: string;
      channels: NotificationChannel[];
      scheduledFor?: Date | null;
    };

    // Only ADMIN can broadcast to school-wide audiences.
    // TEACHER may broadcast to CLASS they teach.
    if (user.role !== 'ADMIN') {
      if (body.audience !== 'CLASS' || !body.classId) {
        throw Forbidden('Only ADMIN can broadcast beyond a single class');
      }
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!teacher) throw Forbidden();
      const teaches = await prisma.classSubject.findFirst({
        where: { teacherId: teacher.id, classId: body.classId },
        select: { id: true },
      });
      const isClassTeacher = await prisma.class.findFirst({
        where: { id: body.classId, classTeacherId: teacher.id },
        select: { id: true },
      });
      if (!teaches && !isClassTeacher) {
        throw Forbidden('You do not teach this class');
      }
    }

    const created = await notificationService.create({
      title: body.title,
      body: body.body,
      audience: body.audience,
      classId: body.classId,
      channels: body.channels,
      scheduledFor: body.scheduledFor ?? null,
      createdById: user.id,
    });

    res.status(201).json({
      success: true,
      data: {
        id: created.id,
        title: created.title,
        status: created.status,
        recipientCount: created.recipients.length,
        scheduledFor: created.scheduledFor,
      },
    });
  },

  async list(req: Request, res: Response) {
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
      status?: NotificationStatus;
    };
    const where = q.status ? { status: q.status } : {};
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: q.skip,
        take: q.take,
        select: {
          id: true,
          title: true,
          audience: true,
          status: true,
          scheduledFor: true,
          sentAt: true,
          createdAt: true,
          createdById: true,
          _count: { select: { recipients: true } },
        },
      }),
      prisma.notification.count({ where }),
    ]);
    res.json({
      success: true,
      data: items,
      meta: { page: q.page, limit: q.limit, total },
    });
  },

  async get(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    const n = await prisma.notification.findUnique({
      where: { id },
      include: {
        recipients: {
          select: {
            id: true,
            userId: true,
            channel: true,
            status: true,
            sentAt: true,
            readAt: true,
            error: true,
            user: { select: { email: true, role: true } },
          },
        },
      },
    });
    if (!n) throw NotFound('Notification not found');
    res.json({ success: true, data: n });
  },

  async cancel(req: Request, res: Response) {
    const { id } = req.validatedParams as { id: string };
    const n = await prisma.notification.findUnique({ where: { id } });
    if (!n) throw NotFound('Notification not found');
    if (n.status !== 'PENDING') {
      throw BadRequest('Only PENDING notifications can be cancelled');
    }

    const [, updated] = await prisma.$transaction([
      prisma.notificationRecipient.updateMany({
        where: { notificationId: id, status: 'PENDING' },
        data: { status: 'FAILED', error: 'Cancelled by admin' },
      }),
      prisma.notification.update({
        where: { id },
        data: { status: 'FAILED' },
      }),
    ]);

    res.json({ success: true, data: { id: updated.id, status: updated.status } });
  },

  // ─── Inbox (current user) ─────────────────────────────

  async inbox(req: Request, res: Response) {
    const user = requireUser(req);
    const q = req.validatedQuery as {
      skip: number;
      take: number;
      page: number;
      limit: number;
    };

    const where = {
      userId: user.id,
      channel: 'IN_APP' as const,
      status: 'SENT' as const,
    };

    const [items, total, unread] = await Promise.all([
      prisma.notificationRecipient.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip: q.skip,
        take: q.take,
        include: {
          notification: {
            select: { id: true, title: true, body: true, audience: true, createdAt: true },
          },
        },
      }),
      prisma.notificationRecipient.count({ where }),
      prisma.notificationRecipient.count({
        where: { ...where, readAt: null },
      }),
    ]);

    res.json({
      success: true,
      data: items.map((r) => ({
        recipientId: r.id,
        readAt: r.readAt,
        sentAt: r.sentAt,
        notification: r.notification,
      })),
      meta: { page: q.page, limit: q.limit, total, unread },
    });
  },

  async markRead(req: Request, res: Response) {
    const user = requireUser(req);
    const body = req.body as { recipientIds?: string[] };

    if (body.recipientIds?.length) {
      const result = await prisma.notificationRecipient.updateMany({
        where: {
          id: { in: body.recipientIds },
          userId: user.id,
          readAt: null,
        },
        data: { readAt: new Date() },
      });
      return res.json({ success: true, data: { marked: result.count } });
    }

    const result = await prisma.notificationRecipient.updateMany({
      where: { userId: user.id, readAt: null, channel: 'IN_APP' },
      data: { readAt: new Date() },
    });
    res.json({ success: true, data: { marked: result.count } });
  },
};