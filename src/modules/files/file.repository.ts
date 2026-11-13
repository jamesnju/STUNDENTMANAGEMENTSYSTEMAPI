import { Prisma, FileCategory } from '@prisma/client';
import { prisma } from '../../config/database';

export const fileRepository = {
  create: (data: Prisma.FileCreateInput) =>
    prisma.file.create({ data }),

  findById: (id: string) =>
    prisma.file.findUnique({ where: { id } }),

  list: (args: {
    skip: number;
    take: number;
    category?: FileCategory;
    uploadedById?: string;
  }) => {
    const where: Prisma.FileWhereInput = {};
    if (args.category) where.category = args.category;
    if (args.uploadedById) where.uploadedById = args.uploadedById;

    return Promise.all([
      prisma.file.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.file.count({ where }),
    ]);
  },

  delete: (id: string) => prisma.file.delete({ where: { id } }),
};