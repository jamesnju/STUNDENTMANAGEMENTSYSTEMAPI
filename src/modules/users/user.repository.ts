import { Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/database';

export const userRepository = {
  /** Default filter used by active listings — excludes soft-deleted. */
  activeFilter: (): Prisma.UserWhereInput => ({
    deletedAt: null,
    isActive: true,
  }),

  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      include: {
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
      },
    }),

  listActive: (args: {
    skip: number;
    take: number;
    role?: Role;
    departmentId?: string;
    isActive?: boolean;
    search?: string;
  }) => {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    if (args.role) where.role = args.role;
    if (typeof args.isActive === 'boolean') where.isActive = args.isActive;
    if (args.search) where.email = { contains: args.search, mode: 'insensitive' };
    if (args.departmentId) {
      where.OR = [
        { teacherProfile: { departmentId: args.departmentId, deletedAt: null } },
        { studentProfile: { departmentId: args.departmentId, deletedAt: null } },
      ];
    }
    return Promise.all([
      prisma.user.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: { createdAt: 'desc' },
        include: {
          teacherProfile: { select: { firstName: true, lastName: true, departmentId: true } },
          studentProfile: { select: { firstName: true, lastName: true, departmentId: true } },
          parentProfile: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
  },

  listArchived: (args: { skip: number; take: number; role?: Role }) => {
    const where: Prisma.UserWhereInput = { deletedAt: { not: null } };
    if (args.role) where.role = args.role;
    return Promise.all([
      prisma.user.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: { deletedAt: 'desc' },
        include: {
          teacherProfile: true,
          studentProfile: true,
          parentProfile: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
  },
};