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
        OR: [
          { classId: { in: classIds } },
          { studentId },
        ],
      },
      include: {
        class: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
    });
  },

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
};