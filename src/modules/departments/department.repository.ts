import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export const departmentRepository = {
  findById: (id: string) =>
    prisma.department.findUnique({ where: { id } }),

  findByCode: (code: string) =>
    prisma.department.findUnique({ where: { code } }),

  findByName: (name: string) =>
    prisma.department.findUnique({ where: { name } }),

  /** Counts active members (soft-deleted excluded) for delete-guard. */
  countActiveMembers: async (departmentId: string) => {
    const [teacherCount, studentCount] = await Promise.all([
      prisma.teacher.count({ where: { departmentId, deletedAt: null } }),
      prisma.student.count({ where: { departmentId, deletedAt: null } }),
    ]);
    return { teacherCount, studentCount, total: teacherCount + studentCount };
  },

  list: (args: { skip: number; take: number; search?: string; sortBy?: string; sortDir: 'asc' | 'desc' }) => {
    const where: Prisma.DepartmentWhereInput = {};
    if (args.search) {
      where.OR = [
        { name: { contains: args.search, mode: 'insensitive' } },
        { code: { contains: args.search, mode: 'insensitive' } },
      ];
    }
    const orderBy: Prisma.DepartmentOrderByWithRelationInput = {
      [args.sortBy ?? 'createdAt']: args.sortDir,
    };
    return Promise.all([
      prisma.department.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy,
        include: {
          _count: {
            select: {
              teachers: { where: { deletedAt: null } },
              students: { where: { deletedAt: null } },
            },
          },
        },
      }),
      prisma.department.count({ where }),
    ]);
  },

  create: (data: { name: string; code: string }) =>
    prisma.department.create({ data }),

  update: (id: string, data: { name?: string; code?: string }) =>
    prisma.department.update({ where: { id }, data }),

  delete: (id: string) => prisma.department.delete({ where: { id } }),
};