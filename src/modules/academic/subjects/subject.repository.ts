import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database';

export const subjectRepository = {
  findById: (id: string) => prisma.subject.findUnique({ where: { id } }),

  findByCode: (code: string) => prisma.subject.findUnique({ where: { code } }),

  list: (args: {
    skip: number;
    take: number;
    search?: string;
    departmentId?: string;
    isActive?: boolean;
  }) => {
    const where: Prisma.SubjectWhereInput = { deletedAt: null };
    if (args.departmentId) where.departmentId = args.departmentId;
    if (args.isActive !== undefined) where.isActive = args.isActive;
    if (args.search) {
      where.OR = [
        { name: { contains: args.search, mode: 'insensitive' } },
        { code: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    return Promise.all([
      prisma.subject.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: { name: 'asc' },
        include: {
          department: { select: { id: true, name: true, code: true } },
          _count: { select: { classes: true } },
        },
      }),
      prisma.subject.count({ where }),
    ]);
  },

  create: (data: Prisma.SubjectCreateInput) => prisma.subject.create({ data }),

  update: (id: string, data: Prisma.SubjectUpdateInput) =>
    prisma.subject.update({ where: { id }, data }),

  softDelete: (id: string) =>
    prisma.subject.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    }),
};