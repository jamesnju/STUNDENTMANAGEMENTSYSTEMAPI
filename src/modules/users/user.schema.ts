import { z } from 'zod';
import { Role } from '@prisma/client';
import { paginationSchema } from '../../shared/utils/pagination';

const baseUser = {
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 chars'),
};

const teacherFields = z.object({
  role: z.literal(Role.TEACHER),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  employeeCode: z.string().min(1),
  hireDate: z.coerce.date(),
  departmentId: z.string().cuid(),
});

const studentFields = z.object({
  role: z.literal(Role.STUDENT),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  admissionNo: z.string().min(1),
  dateOfBirth: z.coerce.date(),
  departmentId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
});

const parentFields = z.object({
  role: z.literal(Role.PARENT),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(7).max(20).optional(),
});

const adminFields = z.object({
  role: z.literal(Role.ADMIN),
});

export const createUserSchema = z.object(baseUser).and(
  z.discriminatedUnion('role', [teacherFields, studentFields, parentFields, adminFields]),
);

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  profile: z
    .object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      phone: z.string().optional(),
      departmentId: z.string().cuid().optional(),
      parentId: z.string().cuid().nullable().optional(),
    })
    .optional(),
});

export const listUsersSchema = paginationSchema.extend({
  role: z.nativeEnum(Role).optional(),
  departmentId: z.string().cuid().optional(),
  isActive: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true')
    .optional(),
});

export const idParamSchema = z.object({ id: z.string().cuid() });