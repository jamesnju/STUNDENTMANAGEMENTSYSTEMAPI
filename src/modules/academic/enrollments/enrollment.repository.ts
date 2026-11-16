import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database';

export const enrollmentRepository = {
  findById: (id: string) =>
    prisma.classEnrollment.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true, code: true } },
        student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
      },
    }),

  findUnique: (classId: string, studentId: string, term: string) =>
    prisma.classEnrollment.findUnique({
      where: { classId_studentId_term: { classId, studentId, term } },
    }),

  list: (args: {
    skip: number;
    take: number;
    classId?: string;
    studentId?: string;
    term?: string;
    isActive?: boolean;
  }) => {
    const where: Prisma.ClassEnrollmentWhereInput = {};
    if (args.classId) where.classId = args.classId;
    if (args.studentId) where.studentId = args.studentId;
    if (args.term) where.term = args.term;
    if (args.isActive !== undefined) where.isActive = args.isActive;

    return Promise.all([
      prisma.classEnrollment.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: { enrolledAt: 'desc' },
        include: {
          class: { select: { id: true, name: true, code: true } },
          student: {
            select: { id: true, firstName: true, lastName: true, admissionNo: true },
          },
        },
      }),
      prisma.classEnrollment.count({ where }),
    ]);
  },

  create: (data: Prisma.ClassEnrollmentCreateInput) =>
    prisma.classEnrollment.create({ data }),

  deactivate: (id: string) =>
    prisma.classEnrollment.update({ where: { id }, data: { isActive: false } }),
};