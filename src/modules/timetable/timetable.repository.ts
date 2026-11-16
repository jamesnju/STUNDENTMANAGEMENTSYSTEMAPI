import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export const timetableRepository = {
  findById: (id: string) =>
    prisma.timetableSlot.findUnique({ where: { id } }),

  list: (args: {
    skip: number;
    take: number;
    classId?: string;
    teacherId?: string;
    subjectId?: string;
    studentId?: string;
    dayOfWeek?: number;
  }) => {
    const where: Prisma.TimetableSlotWhereInput = {};
    if (args.classId) where.classId = args.classId;
    if (args.teacherId) where.teacherId = args.teacherId;
    if (args.subjectId) where.subjectId = args.subjectId;
    if (args.studentId) where.studentId = args.studentId;
    if (args.dayOfWeek) where.dayOfWeek = args.dayOfWeek;

    return Promise.all([
      prisma.timetableSlot.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
        include: {
          class: { select: { id: true, name: true, code: true } },
          subject: { select: { id: true, name: true, code: true } },
          teacher: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.timetableSlot.count({ where }),
    ]);
  },

  /** Detect whether (teacher|class) already occupies the given (day, period). */
  findConflicts: async (args: {
    dayOfWeek: number;
    period: number;
    classId: string;
    teacherId: string;
    excludeId?: string;
  }) => {
    const base: Prisma.TimetableSlotWhereInput = {
      dayOfWeek: args.dayOfWeek,
      period: args.period,
      ...(args.excludeId ? { id: { not: args.excludeId } } : {}),
    };

    const [classConflict, teacherConflict] = await Promise.all([
      prisma.timetableSlot.findFirst({
        where: { ...base, classId: args.classId },
        select: { id: true },
      }),
      prisma.timetableSlot.findFirst({
        where: { ...base, teacherId: args.teacherId },
        select: { id: true },
      }),
    ]);

    return { classConflict, teacherConflict };
  },

  create: (data: Prisma.TimetableSlotCreateInput) =>
    prisma.timetableSlot.create({ data }),

  update: (id: string, data: Prisma.TimetableSlotUpdateInput) =>
    prisma.timetableSlot.update({ where: { id }, data }),

  delete: (id: string) => prisma.timetableSlot.delete({ where: { id } }),
};