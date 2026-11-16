import { Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/database';

/**
 * Select shape for profile sub-objects on user listings.
 * `id` here is the PROFILE row id (Teacher.id / Student.id / Parent.id),
 * NOT the User.id. Domain FKs (timetable, class-subject, submission grader)
 * require the profile id — never send User.id where a profile id is expected.
 */
const teacherProfileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  departmentId: true,
  employeeCode: true,
} satisfies Prisma.TeacherSelect;

const studentProfileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  departmentId: true,
  admissionNo: true,
  parentId: true,
} satisfies Prisma.StudentSelect;

const parentProfileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
} satisfies Prisma.ParentSelect;

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
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
          teacherProfile: { select: teacherProfileSelect },
          studentProfile: { select: studentProfileSelect },
          parentProfile: { select: parentProfileSelect },
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
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
          teacherProfile: { select: teacherProfileSelect },
          studentProfile: { select: studentProfileSelect },
          parentProfile: { select: parentProfileSelect },
        },
      }),
      prisma.user.count({ where }),
    ]);
  },
};