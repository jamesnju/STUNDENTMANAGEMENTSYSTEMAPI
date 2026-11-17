import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export const timetableRepository = {
  findById: (id: string) =>
    prisma.timetableSlot.findUnique({
      where: { id },
      include: {
        roomRel: { select: { id: true, name: true, code: true, building: true } },
      },
    }),

  list: (args: {
    skip: number;
    take: number;
    classId?: string;
    teacherId?: string;
    subjectId?: string;
    studentId?: string;
    roomId?: string;
    dayOfWeek?: number;
  }) => {
    const where: Prisma.TimetableSlotWhereInput = {};
    if (args.classId) where.classId = args.classId;
    if (args.teacherId) where.teacherId = args.teacherId;
    if (args.subjectId) where.subjectId = args.subjectId;
    if (args.studentId) where.studentId = args.studentId;
    if (args.roomId) where.roomId = args.roomId;
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
          roomRel: { select: { id: true, name: true, code: true, building: true } },
        },
      }),
      prisma.timetableSlot.count({ where }),
    ]);
  },

  /**
   * Conflicts = same day AND overlapping time range.
   *
   * Two ranges [aS, aE) and [bS, bE) overlap iff (aS < bE && bS < aE).
   * We treat endTime as EXCLUSIVE: 08:00–08:40 and 08:40–09:20 do NOT overlap.
   * HH:MM strings sort lexicographically in chronological order, so Prisma can
   * compare them as strings directly.
   */
  findConflicts: async (args: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classId: string;
    teacherId: string;
    roomId?: string;
    excludeId?: string;
  }) => {
    const overlap = {
      dayOfWeek: args.dayOfWeek,
      startTime: { lt: args.endTime },   // existing.start < new.end
      endTime: { gt: args.startTime },   // existing.end   > new.start
      ...(args.excludeId ? { id: { not: args.excludeId } } : {}),
    } satisfies Prisma.TimetableSlotWhereInput;

    const [classConflict, teacherConflict, roomConflict] = await Promise.all([
      prisma.timetableSlot.findFirst({
        where: { ...overlap, classId: args.classId },
        select: { id: true },
      }),
      prisma.timetableSlot.findFirst({
        where: { ...overlap, teacherId: args.teacherId },
        select: { id: true },
      }),
      args.roomId
        ? prisma.timetableSlot.findFirst({
            where: { ...overlap, roomId: args.roomId },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    return { classConflict, teacherConflict, roomConflict };
  },

  create: (data: Prisma.TimetableSlotCreateInput) =>
    prisma.timetableSlot.create({ data }),

  update: (id: string, data: Prisma.TimetableSlotUpdateInput) =>
    prisma.timetableSlot.update({ where: { id }, data }),

  delete: (id: string) => prisma.timetableSlot.delete({ where: { id } }),
};

// import { Prisma } from '@prisma/client';
// import { prisma } from '../../config/database';

// export const timetableRepository = {
//   findById: (id: string) =>
//     prisma.timetableSlot.findUnique({
//       where: { id },
//       include: {
//         roomRel: { select: { id: true, name: true, code: true, building: true } },
//       },
//     }),

//   list: (args: {
//     skip: number;
//     take: number;
//     classId?: string;
//     teacherId?: string;
//     subjectId?: string;
//     studentId?: string;
//     roomId?: string;
//     dayOfWeek?: number;
//   }) => {
//     const where: Prisma.TimetableSlotWhereInput = {};
//     if (args.classId) where.classId = args.classId;
//     if (args.teacherId) where.teacherId = args.teacherId;
//     if (args.subjectId) where.subjectId = args.subjectId;
//     if (args.studentId) where.studentId = args.studentId;
//     if (args.roomId) where.roomId = args.roomId;
//     if (args.dayOfWeek) where.dayOfWeek = args.dayOfWeek;

//     return Promise.all([
//       prisma.timetableSlot.findMany({
//         where,
//         skip: args.skip,
//         take: args.take,
//         orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
//         include: {
//           class: { select: { id: true, name: true, code: true } },
//           subject: { select: { id: true, name: true, code: true } },
//           teacher: { select: { id: true, firstName: true, lastName: true } },
//           roomRel: { select: { id: true, name: true, code: true, building: true } },
//         },
//       }),
//       prisma.timetableSlot.count({ where }),
//     ]);
//   },

//   findConflicts: async (args: {
//     dayOfWeek: number;
//     period: number;
//     classId: string;
//     teacherId: string;
//     roomId?: string;
//     excludeId?: string;
//   }) => {
//     const base: Prisma.TimetableSlotWhereInput = {
//       dayOfWeek: args.dayOfWeek,
//       period: args.period,
//       ...(args.excludeId ? { id: { not: args.excludeId } } : {}),
//     };

//     const [classConflict, teacherConflict, roomConflict] = await Promise.all([
//       prisma.timetableSlot.findFirst({
//         where: { ...base, classId: args.classId },
//         select: { id: true },
//       }),
//       prisma.timetableSlot.findFirst({
//         where: { ...base, teacherId: args.teacherId },
//         select: { id: true },
//       }),
//       args.roomId
//         ? prisma.timetableSlot.findFirst({
//             where: { ...base, roomId: args.roomId },
//             select: { id: true },
//           })
//         : Promise.resolve(null),
//     ]);

//     return { classConflict, teacherConflict, roomConflict };
//   },

//   create: (data: Prisma.TimetableSlotCreateInput) =>
//     prisma.timetableSlot.create({ data }),

//   update: (id: string, data: Prisma.TimetableSlotUpdateInput) =>
//     prisma.timetableSlot.update({ where: { id }, data }),

//   delete: (id: string) => prisma.timetableSlot.delete({ where: { id } }),
// };