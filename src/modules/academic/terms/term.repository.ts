import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database';

export const termRepository = {
  findById: (id: string) => prisma.term.findUnique({ where: { id } }),

  findByNameYear: (name: string, academicYear: string) =>
    prisma.term.findUnique({ where: { academicYear_name: { academicYear, name } } }),

  findActive: () => prisma.term.findFirst({ where: { isActive: true } }),

  list: (args: {
    skip: number;
    take: number;
    academicYear?: string;
    isActive?: boolean;
  }) => {
    const where: Prisma.TermWhereInput = {};
    if (args.academicYear) where.academicYear = args.academicYear;
    if (args.isActive !== undefined) where.isActive = args.isActive;

    return Promise.all([
      prisma.term.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: [{ academicYear: 'desc' }, { startsAt: 'desc' }],
      }),
      prisma.term.count({ where }),
    ]);
  },

  create: (data: Prisma.TermCreateInput) => prisma.term.create({ data }),

  update: (id: string, data: Prisma.TermUpdateInput) =>
    prisma.term.update({ where: { id }, data }),

  deactivateAll: () => prisma.term.updateMany({ where: { isActive: true }, data: { isActive: false } }),
};