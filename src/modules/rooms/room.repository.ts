import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export const roomRepository = {
  findById: (id: string) => prisma.room.findUnique({ where: { id } }),

  findByName: (name: string) => prisma.room.findUnique({ where: { name } }),

  findByCode: (code: string) => prisma.room.findUnique({ where: { code } }),

  list: (args: {
    skip: number;
    take: number;
    search?: string;
    building?: string;
    isActive?: boolean;
  }) => {
    const where: Prisma.RoomWhereInput = {};
    if (args.building) where.building = args.building;
    if (args.isActive !== undefined) where.isActive = args.isActive;
    if (args.search) {
      where.OR = [
        { name: { contains: args.search, mode: 'insensitive' } },
        { code: { contains: args.search, mode: 'insensitive' } },
        { building: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    return Promise.all([
      prisma.room.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: [{ building: 'asc' }, { name: 'asc' }],
      }),
      prisma.room.count({ where }),
    ]);
  },

  create: (data: Prisma.RoomCreateInput) => prisma.room.create({ data }),

  update: (id: string, data: Prisma.RoomUpdateInput) =>
    prisma.room.update({ where: { id }, data }),

  softDelete: (id: string) =>
    prisma.room.update({ where: { id }, data: { isActive: false } }),
};