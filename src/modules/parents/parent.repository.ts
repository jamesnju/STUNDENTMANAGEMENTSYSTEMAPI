import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

const childSelect = {
  id: true,
  firstName: true,
  lastName: true,
  admissionNo: true,
  department: { select: { id: true, name: true, code: true } },
} as const;

export const parentRepository = {
  findByUserId: (userId: string) =>
    prisma.parent.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true } },
      },
    }),

  listChildren: (parentId: string) =>
    prisma.student.findMany({
      where: { parentId, deletedAt: null, isActive: true },
      select: childSelect,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),

  /** Assert this child belongs to this parent, or return null. */
  findChildForParent: (parentId: string, studentId: string) =>
    prisma.student.findFirst({
      where: { id: studentId, parentId, deletedAt: null, isActive: true },
      select: childSelect,
    }),

  childTimetable: async (studentId: string) => {
    const enrollments = await prisma.classEnrollment.findMany({
      where: { studentId, isActive: true, class: { deletedAt: null, isActive: true } },
      select: { classId: true },
    });
    const classIds = enrollments.map((e) => e.classId);

    return prisma.timetableSlot.findMany({
      where: { OR: [{ classId: { in: classIds } }, { studentId }] },
      include: {
        class: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
        roomRel: { select: { id: true, name: true, code: true, building: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
    });
  },

  childNotes: (studentId: string, args: { skip: number; take: number }) => {
    const where = {
      deletedAt: null,
      isPublished: true,
      class: {
        enrollments: { some: { studentId, isActive: true } },
      },
    } as const;
    return Promise.all([
      prisma.note.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: { createdAt: 'desc' },
        include: {
          files: {
            select: { id: true, url: true, originalName: true, mimeType: true, bytes: true },
          },
          teacher: { select: { id: true, firstName: true, lastName: true } },
          class: { select: { id: true, name: true, code: true } },
          subject: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.note.count({ where }),
    ]);
  },

childAssignments: (studentId: string, args: { skip: number; take: number }) => {
  const where: Prisma.AssignmentWhereInput = {
    deletedAt: null,
    status: { in: ['PUBLISHED', 'CLOSED'] },   // no `as const`
    class: {
      enrollments: { some: { studentId, isActive: true } },
    },
  };
  return Promise.all([
    prisma.assignment.findMany({
      where,
      skip: args.skip,
      take: args.take,
      orderBy: { createdAt: 'desc' },
      include: {
        files: {
          select: { id: true, url: true, originalName: true, mimeType: true, bytes: true },
        },
        teacher: { select: { id: true, firstName: true, lastName: true } },
        class: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
      },
    }),
    prisma.assignment.count({ where }),
  ]);
},
};