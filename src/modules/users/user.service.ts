import { Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { hashPassword } from '../../shared/utils/password';
import { BadRequest, Conflict, NotFound } from '../../shared/errors/httpErrors';
import { userRepository } from './user.repository';

type CreateInput = {
  email: string;
  password: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  phone?: string;
  employeeCode?: string;
  hireDate?: Date;
  admissionNo?: string;
  dateOfBirth?: Date;
  departmentId?: string;
  parentId?: string;
};

export const userService = {
  async create(input: CreateInput) {
    if (await prisma.user.findUnique({ where: { email: input.email } }))
      throw Conflict('Email already in use');

    const passwordHash = await hashPassword(input.password);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: input.email, passwordHash, role: input.role },
      });

      if (input.role === Role.TEACHER) {
        if (!input.departmentId) throw BadRequest('departmentId required');
        const dept = await tx.department.findUnique({ where: { id: input.departmentId } });
        if (!dept) throw BadRequest('Invalid departmentId');
        if (!input.employeeCode || !input.hireDate || !input.firstName || !input.lastName)
          throw BadRequest('Missing teacher fields');

        await tx.teacher.create({
          data: {
            userId: user.id,
            departmentId: input.departmentId,
            firstName: input.firstName,
            lastName: input.lastName,
            employeeCode: input.employeeCode,
            hireDate: input.hireDate,
          },
        });
      } else if (input.role === Role.STUDENT) {
        if (!input.departmentId) throw BadRequest('departmentId required');
        const dept = await tx.department.findUnique({ where: { id: input.departmentId } });
        if (!dept) throw BadRequest('Invalid departmentId');
        if (!input.admissionNo || !input.dateOfBirth || !input.firstName || !input.lastName)
          throw BadRequest('Missing student fields');
        if (input.parentId) {
          const parent = await tx.parent.findUnique({ where: { id: input.parentId } });
          if (!parent) throw BadRequest('Invalid parentId');
        }

        await tx.student.create({
          data: {
            userId: user.id,
            departmentId: input.departmentId,
            firstName: input.firstName,
            lastName: input.lastName,
            admissionNo: input.admissionNo,
            dateOfBirth: input.dateOfBirth,
            parentId: input.parentId ?? null,
          },
        });
      } else if (input.role === Role.PARENT) {
        if (!input.firstName || !input.lastName) throw BadRequest('Missing parent fields');
        await tx.parent.create({
          data: {
            userId: user.id,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone ?? null,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: user.id },
        include: { teacherProfile: true, studentProfile: true, parentProfile: true },
      });
    });
  },

  async list(query: {
    skip: number;
    take: number;
    role?: Role;
    departmentId?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const [items, total] = await userRepository.listActive(query);
    return { items, total };
  },

  async listArchived(query: { skip: number; take: number; role?: Role }) {
    const [items, total] = await userRepository.listArchived(query);
    return { items, total };
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw NotFound('User not found');
    return user;
  },

  async update(
    id: string,
    input: {
      email?: string;
      isActive?: boolean;
      profile?: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        departmentId?: string;
        parentId?: string | null;
      };
    },
  ) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { teacherProfile: true, studentProfile: true, parentProfile: true },
    });
    if (!user) throw NotFound('User not found');

    return prisma.$transaction(async (tx) => {
      if (input.email && input.email !== user.email) {
        if (await tx.user.findUnique({ where: { email: input.email } }))
          throw Conflict('Email already in use');
        await tx.user.update({ where: { id }, data: { email: input.email } });
      }
      if (typeof input.isActive === 'boolean') {
        await tx.user.update({ where: { id }, data: { isActive: input.isActive } });
      }

      if (input.profile) {
        const p = input.profile;
        if (user.teacherProfile) {
          await tx.teacher.update({
            where: { id: user.teacherProfile.id },
            data: {
              firstName: p.firstName,
              lastName: p.lastName,
              departmentId: p.departmentId,
            },
          });
        } else if (user.studentProfile) {
          await tx.student.update({
            where: { id: user.studentProfile.id },
            data: {
              firstName: p.firstName,
              lastName: p.lastName,
              departmentId: p.departmentId,
              parentId: p.parentId,
            },
          });
        } else if (user.parentProfile) {
          await tx.parent.update({
            where: { id: user.parentProfile.id },
            data: { firstName: p.firstName, lastName: p.lastName, phone: p.phone },
          });
        }
      }

      return tx.user.findUnique({
        where: { id },
        include: { teacherProfile: true, studentProfile: true, parentProfile: true },
      });
    });
  },

  async softDelete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw NotFound('User not found');
    if (user.deletedAt) throw Conflict('User already archived');

    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
          tokenVersion: { increment: 1 },
        },
      });
      if (user.role === Role.TEACHER) {
        await tx.teacher.updateMany({
          where: { userId: id },
          data: { deletedAt: new Date(), isActive: false },
        });
      } else if (user.role === Role.STUDENT) {
        await tx.student.updateMany({
          where: { userId: id },
          data: { deletedAt: new Date(), isActive: false },
        });
      }
      return { id, restored: false };
    });
  },

  async restore(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw NotFound('User not found');
    if (!user.deletedAt) throw Conflict('User is not archived');

    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { deletedAt: null, isActive: true },
      });
      if (user.role === Role.TEACHER) {
        await tx.teacher.updateMany({
          where: { userId: id },
          data: { deletedAt: null, isActive: true },
        });
      } else if (user.role === Role.STUDENT) {
        await tx.student.updateMany({
          where: { userId: id },
          data: { deletedAt: null, isActive: true },
        });
      }
      return { id, restored: true };
    });
  },
};