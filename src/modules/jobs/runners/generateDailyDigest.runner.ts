import { prisma } from '../../../config/database';
import { JobResult } from '../../../types/runners/types';
import { notificationService } from '../../notifications/notification.service';

type Input = {
  /** ISO date to generate for; defaults to today. */
  forDate?: string;
};

export const generateDailyDigestRunner = async (
  input?: Input,
): Promise<JobResult> => {
  const day = input?.forDate ? new Date(input.forDate) : new Date();
  if (Number.isNaN(day.getTime())) {
    throw new Error(`generateDailyDigest: invalid forDate "${input?.forDate}"`);
  }

  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  // Prisma TimetableSlot.dayOfWeek: 1=Mon … 5=Fri. getUTCDay(): 0=Sun … 6=Sat.
  const weekday = dayStart.getUTCDay();
  const dows = weekday >= 1 && weekday <= 5 ? [weekday] : [];

  let teacherDigests = 0;
  let parentDigests = 0;
  let skipped = 0;
  let failed = 0;

  // Reminders/digests are system-generated: attribute authorship to an admin.
  const admin = await getAdminUserId();
  if (!admin) {
    return {
      ok: false,
      summary: { error: 'No active ADMIN to author digests' },
    };
  }

  // ═══════════════════════════════════════════════════════
  // TEACHER DIGEST
  // ═══════════════════════════════════════════════════════
  const teachers = await prisma.teacher.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, userId: true, firstName: true },
    take: 500,
  });

  for (const t of teachers) {
    try {
      const [slots, assessmentsOpening, assignmentsDue, ungraded] = await Promise.all([
        dows.length
          ? prisma.timetableSlot.findMany({
              where: { teacherId: t.id, dayOfWeek: { in: dows } },
              include: {
                class: { select: { name: true } },
                subject: { select: { name: true } },
              },
              orderBy: [{ period: 'asc' }],
            })
          : Promise.resolve([] as Array<{
              startTime: string;
              endTime: string;
              room: string | null;
              class: { name: string };
              subject: { name: string };
            }>),
        prisma.assessment.findMany({
          where: {
            teacherId: t.id,
            deletedAt: null,
            opensAt: { gte: dayStart, lte: dayEnd },
          },
          select: { title: true, opensAt: true, class: { select: { name: true } } },
        }),
        prisma.assignment.findMany({
          where: {
            teacherId: t.id,
            deletedAt: null,
            dueAt: { gte: dayStart, lte: dayEnd },
          },
          select: { title: true, dueAt: true, class: { select: { name: true } } },
        }),
        prisma.submission.count({
          where: { gradedById: null, assignment: { teacherId: t.id, deletedAt: null } },
        }),
      ]);

      const hasActivity =
        slots.length > 0 ||
        assessmentsOpening.length > 0 ||
        assignmentsDue.length > 0 ||
        ungraded > 0;

      if (!hasActivity) {
        skipped++;
        continue;
      }

      const lines: string[] = [`Good morning ${t.firstName},`, ''];

      if (slots.length) {
        lines.push(`📅 Classes today (${slots.length}):`);
        for (const s of slots) {
          const room = s.room ? ` (${s.room})` : '';
          lines.push(
            `  • ${s.startTime}-${s.endTime} ${s.subject.name} — ${s.class.name}${room}`,
          );
        }
        lines.push('');
      }
      if (assessmentsOpening.length) {
        lines.push('📝 Assessments opening today:');
        for (const a of assessmentsOpening) {
          lines.push(`  • ${a.title} — ${a.class.name}`);
        }
        lines.push('');
      }
      if (assignmentsDue.length) {
        lines.push('📌 Assignments due today:');
        for (const a of assignmentsDue) {
          lines.push(`  • ${a.title} — ${a.class.name}`);
        }
        lines.push('');
      }
      if (ungraded > 0) {
        lines.push(`🧮 ${ungraded} submission(s) awaiting grading.`);
      }

      await notificationService.create({
        title: `Daily digest — ${dayStart.toISOString().slice(0, 10)}`,
        body: lines.join('\n'),
        audience: 'TEACHERS', // unused when recipientUserIds is provided
        channels: ['EMAIL'],
        scheduledFor: null,
        createdById: admin,
        recipientUserIds: [t.userId],
      });

      teacherDigests++;
    } catch {
      failed++;
    }
  }

  // ═══════════════════════════════════════════════════════
  // PARENT DIGEST
  // ═══════════════════════════════════════════════════════
  const parents = await prisma.parent.findMany({
    select: {
      id: true,
      userId: true,
      firstName: true,
      students: {
        where: { deletedAt: null, isActive: true },
        select: { id: true, firstName: true },
      },
    },
    take: 1000,
  });

  for (const p of parents) {
    if (p.students.length === 0) {
      skipped++;
      continue;
    }
    const studentIds = p.students.map((s) => s.id);

    try {
      // Split the timetable fetch out of the enrollment query. This gives a
      // single concrete return type for `classTimetables` (no union caused by
      // the `include: false` branch), so `subject` is always present.
      const [enrollments, classTimetables, assessmentsOpening, assignmentsDue] =
        await Promise.all([
          prisma.classEnrollment.findMany({
            where: { studentId: { in: studentIds }, isActive: true },
            include: {
              student: { select: { firstName: true } },
              class: { select: { id: true, name: true } },
            },
          }),
          dows.length
            ? prisma.timetableSlot.findMany({
                where: {
                  dayOfWeek: { in: dows },
                  class: {
                    enrollments: {
                      some: { studentId: { in: studentIds }, isActive: true },
                    },
                  },
                },
                include: { subject: { select: { name: true } } },
                orderBy: { period: 'asc' },
              })
            : Promise.resolve([] as Array<{
                classId: string;
                startTime: string;
                endTime: string;
                subject: { name: string };
              }>),
          prisma.assessment.findMany({
            where: {
              deletedAt: null,
              opensAt: { gte: dayStart, lte: dayEnd },
              class: {
                enrollments: {
                  some: { studentId: { in: studentIds }, isActive: true },
                },
              },
            },
            select: { title: true, type: true, class: { select: { name: true } } },
          }),
          prisma.assignment.findMany({
            where: {
              deletedAt: null,
              status: 'PUBLISHED',
              dueAt: { gte: dayStart, lte: dayEnd },
              class: {
                enrollments: {
                  some: { studentId: { in: studentIds }, isActive: true },
                },
              },
            },
            select: { title: true, class: { select: { name: true } } },
          }),
        ]);

      // Group the day's timetable slots by class so we can render them per child.
      const slotsByClass = new Map<string, typeof classTimetables>();
      for (const s of classTimetables) {
        const list = slotsByClass.get(s.classId) ?? [];
        list.push(s);
        slotsByClass.set(s.classId, list);
      }

      const anyTimetable = classTimetables.length > 0;

      if (
        assessmentsOpening.length === 0 &&
        assignmentsDue.length === 0 &&
        !anyTimetable
      ) {
        skipped++;
        continue;
      }

      const lines: string[] = [
        `Dear ${p.firstName},`,
        '',
        "Here is today's update for your child(ren):",
        '',
      ];

      for (const e of enrollments) {
        const slots = slotsByClass.get(e.class.id) ?? [];
        if (slots.length) {
          lines.push(`${e.student.firstName} — ${e.class.name} classes today:`);
          for (const s of slots) {
            lines.push(`  • ${s.startTime}-${s.endTime} ${s.subject.name}`);
          }
          lines.push('');
        }
      }
      if (assessmentsOpening.length) {
        lines.push('Assessments opening today:');
        for (const a of assessmentsOpening) {
          lines.push(`  • ${a.title} (${a.type}) — ${a.class.name}`);
        }
        lines.push('');
      }
      if (assignmentsDue.length) {
        lines.push('Assignments due today:');
        for (const a of assignmentsDue) {
          lines.push(`  • ${a.title} — ${a.class.name}`);
        }
      }

      await notificationService.create({
        title: `Daily digest — ${dayStart.toISOString().slice(0, 10)}`,
        body: lines.join('\n'),
        audience: 'PARENTS', // unused when recipientUserIds is provided
        channels: ['EMAIL'],
        scheduledFor: null,
        createdById: admin,
        recipientUserIds: [p.userId],
      });

      parentDigests++;
    } catch {
      failed++;
    }
  }

  return {
    ok: failed === 0,
    summary: {
      forDate: dayStart.toISOString().slice(0, 10),
      teachersScanned: teachers.length,
      teacherDigests,
      parentsScanned: parents.length,
      parentDigests,
      skipped,
      failed,
    },
  };
};

// ─── helpers ───────────────────────────────────────────

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

async function getAdminUserId(): Promise<string | null> {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN', isActive: true, deletedAt: null },
    select: { id: true },
  });
  return admin?.id ?? null;
}