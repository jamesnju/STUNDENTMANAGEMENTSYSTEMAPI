import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export const settingsRepository = {
  findByParam: (param: string) =>
    prisma.appSetting.findUnique({ where: { param } }),

  list: (args: {
    skip: number;
    take: number;
    search?: string;
    sortBy?: string;
    sortDir: 'asc' | 'desc';
  }) => {
    const where: Prisma.AppSettingWhereInput = {};
    if (args.search) {
      where.OR = [
        { param: { contains: args.search, mode: 'insensitive' } },
        { description: { contains: args.search, mode: 'insensitive' } },
      ];
    }
    const orderBy: Prisma.AppSettingOrderByWithRelationInput = {
      [args.sortBy ?? 'param']: args.sortDir,
    };
    return Promise.all([
      prisma.appSetting.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy,
      }),
      prisma.appSetting.count({ where }),
    ]);
  },

  create: (data: Prisma.AppSettingCreateInput) =>
    prisma.appSetting.create({ data }),

  update: (param: string, data: Prisma.AppSettingUpdateInput) =>
    prisma.appSetting.update({ where: { param }, data }),

  delete: (param: string) =>
    prisma.appSetting.delete({ where: { param } }),
};