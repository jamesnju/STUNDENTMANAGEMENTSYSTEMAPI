import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database';

export const classRepository = {
  findById: (id: string) =>
    prisma.class.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true, code: true } },
        classTeacher: {
          select: { id: true, firstName: true, lastName: true, userId: true },
        },
        _count: { select: { enrollments: true } },
      },
    }),

  findByCodeYear: (code: string, academicYear: string) =>
    prisma.class.findUnique({ where: { code_academicYear: { code, academicYear } } }),

  list: (args: {
    skip: number;
    take: number;
    search?: string;
    departmentId?: string;
    academicYear?: string;
    isActive?: boolean;
  }) => {
    const where: Prisma.ClassWhereInput = { deletedAt: null };
    if (args.departmentId) where.departmentId = args.departmentId;
    if (args.academicYear) where.academicYear = args.academicYear;
    if (args.isActive !== undefined) where.isActive = args.isActive;
    if (args.search) {
      where.OR = [
        { name: { contains: args.search, mode: 'insensitive' } },
        { code: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    return Promise.all([
      prisma.class.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: [{ academicYear: 'desc' }, { name: 'asc' }],
        include: {
          department: { select: { id: true, name: true, code: true } },
          classTeacher: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { enrollments: true, subjects: true } },
        },
      }),
      prisma.class.count({ where }),
    ]);
  },

  create: (data: Prisma.ClassCreateInput) => prisma.class.create({ data }),

  update: (id: string, data: Prisma.ClassUpdateInput) =>
    prisma.class.update({ where: { id }, data }),

  softDelete: (id: string) =>
    prisma.class.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    }),
};