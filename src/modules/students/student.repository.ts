import { AssignmentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export const studentRepository = {
  findByUserId: (userId: string) =>
    prisma.student.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true } },
        department: { select: { id: true, name: true, code: true } },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            user: { select: { email: true } },
          },
        },
      },
    }),

  listMyClasses: (studentId: string) =>
    prisma.classEnrollment.findMany({
      where: { studentId, isActive: true, class: { deletedAt: null, isActive: true } },
      include: {
        class: {
          include: {
            department: { select: { id: true, name: true, code: true } },
            classTeacher: { select: { id: true, firstName: true, lastName: true } },
            subjects: {
              include: {
                subject: { select: { id: true, name: true, code: true } },
                teacher: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    }),

  /**
   * Timetable for a student = all slots belonging to any of their active classes
   * PLUS student-specific elective slots (studentId set on the slot).
   */
  listMyTimetable: async (studentId: string) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId, isActive: true, class: { deletedAt: null, isActive: true } },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  return prisma.timetableSlot.findMany({
    where: {
      OR: [{ classId: { in: classIds } }, { studentId }],
    },
    include: {
      class: { select: { id: true, name: true, code: true } },
      subject: { select: { id: true, name: true, code: true } },
      teacher: { select: { id: true, firstName: true, lastName: true } },
      roomRel: { select: { id: true, name: true, code: true, building: true } },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
  });
},
  // listMyTimetable: async (studentId: string) => {
  //   const enrollments = await prisma.classEnrollment.findMany({
  //     where: { studentId, isActive: true, class: { deletedAt: null, isActive: true } },
  //     select: { classId: true },
  //   });
  //   const classIds = enrollments.map((e) => e.classId);

  //   return prisma.timetableSlot.findMany({
  //     where: {
  //       OR: [
  //         { classId: { in: classIds } },
  //         { studentId },
  //       ],
  //     },
  //     include: {
  //       class: { select: { id: true, name: true, code: true } },
  //       subject: { select: { id: true, name: true, code: true } },
  //       teacher: { select: { id: true, firstName: true, lastName: true } },
  //     },
  //     orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
  //   });
  // },

  /** Classmates = active students in any of my active classes. */
  listMyClassmates: (args: {
    studentId: string;
    skip: number;
    take: number;
  }) =>
    prisma.student.findMany({
      where: {
        id: { not: args.studentId },
        deletedAt: null,
        isActive: true,
        enrollments: {
          some: {
            isActive: true,
            class: {
              deletedAt: null,
              enrollments: {
                some: { studentId: args.studentId, isActive: true },
              },
            },
          },
        },
      },
      skip: args.skip,
      take: args.take,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNo: true,
      },
    }),
    myNotes: async (studentId: string, args: { skip: number; take: number }) => {
  const where = {
    deletedAt: null,
    isPublished: true,
    class: { enrollments: { some: { studentId, isActive: true } } },
  };
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


myAssignments: async (
  studentId: string,
  args: { skip: number; take: number; status?: AssignmentStatus },
) => {
  const where: Prisma.AssignmentWhereInput = {
    deletedAt: null,
    status: args.status ? args.status : { in: ['PUBLISHED', 'CLOSED'] },
    class: { enrollments: { some: { studentId, isActive: true } } },
  };
  return Promise.all([
    prisma.assignment.findMany({
      where,
      skip: args.skip,
      take: args.take,
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
      include: {
        files: {
          select: { id: true, url: true, originalName: true, mimeType: true, bytes: true },
        },
        teacher: { select: { id: true, firstName: true, lastName: true } },
        class: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        submissions: {
          where: { studentId },
          select: {
            id: true,
            submittedAt: true,
            grade: true,
            feedback: true,
            gradedAt: true,
          },
        },
      },
    }),
    prisma.assignment.count({ where }),
  ]);
},
    
};