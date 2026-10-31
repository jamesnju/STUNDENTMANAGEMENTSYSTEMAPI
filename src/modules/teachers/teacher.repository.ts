import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export const teacherRepository = {
  findByUserId: (userId: string) =>
    prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    }),

  findById: (id: string) =>
    prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    }),

  /** Classes where this teacher is the class teacher OR teaches a subject. */
  listClassesForTeacher: (teacherId: string) =>
    prisma.class.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { classTeacherId: teacherId },
          { subjects: { some: { teacherId } } },
        ],
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { enrollments: { where: { isActive: true } } } },
        subjects: {
          where: { teacherId },
          include: { subject: { select: { id: true, name: true, code: true } } },
        },
      },
      orderBy: { name: 'asc' },
    }),

  /**
   * Students in the teacher's department who are actively enrolled in any
   * class this teacher is associated with (class teacher or subject teacher).
   */
  listStudentsForTeacher: (args: {
    teacherId: string;
    departmentId: string;
    skip: number;
    take: number;
    search?: string;
  }) => {
    const where: Prisma.StudentWhereInput = {
      deletedAt: null,
      isActive: true,
      departmentId: args.departmentId,
      enrollments: {
        some: {
          isActive: true,
          class: {
            deletedAt: null,
            OR: [
              { classTeacherId: args.teacherId },
              { subjects: { some: { teacherId: args.teacherId } } },
            ],
          },
        },
      },
    };

    if (args.search) {
      where.OR = [
        { firstName: { contains: args.search, mode: 'insensitive' } },
        { lastName: { contains: args.search, mode: 'insensitive' } },
        { admissionNo: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    return Promise.all([
      prisma.student.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNo: true,
          dateOfBirth: true,
          departmentId: true,
          user: { select: { email: true } },
          enrollments: {
            where: { isActive: true },
            select: { class: { select: { id: true, name: true, code: true } } },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);
  },

  /** Single student read, but ONLY if the student is in the teacher's scope. */
  findStudentInTeacherScope: (args: {
    studentId: string;
    teacherId: string;
    departmentId: string;
  }) =>
    prisma.student.findFirst({
      where: {
        id: args.studentId,
        deletedAt: null,
        departmentId: args.departmentId,
        enrollments: {
          some: {
            isActive: true,
            class: {
              deletedAt: null,
              OR: [
                { classTeacherId: args.teacherId },
                { subjects: { some: { teacherId: args.teacherId } } },
              ],
            },
          },
        },
      },
      include: {
        user: { select: { email: true, isActive: true } },
        department: { select: { id: true, name: true, code: true } },
        enrollments: {
          where: { isActive: true },
          include: { class: { select: { id: true, name: true, code: true } } },
        },
      },
    }),
};