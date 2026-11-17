import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

const includeFiles = {
  files: {
    select: {
      id: true,
      url: true,
      publicId: true,
      originalName: true,
      mimeType: true,
      bytes: true,
      format: true,
    },
  },
} satisfies Prisma.AssignmentInclude;

const includeRelations = {
  class: { select: { id: true, name: true, code: true } },
  subject: { select: { id: true, name: true, code: true } },
  teacher: { select: { id: true, firstName: true, lastName: true } },
  term: { select: { id: true, name: true, academicYear: true } },
} satisfies Prisma.AssignmentInclude;

export const assignmentRepository = {
  findById: (id: string) =>
    prisma.assignment.findFirst({
      where: { id, deletedAt: null },
      include: { ...includeFiles, ...includeRelations },
    }),

  list: (args: {
    skip: number;
    take: number;
    classId?: string;
    subjectId?: string;
    termId?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
    teacherId?: string;
    search?: string;
    /** When set, restrict to classes the student is enrolled in. */
    enrolledStudentId?: string;
    /** When set, restrict to the given statuses (e.g. non-DRAFT for students). */
    statusIn?: ('DRAFT' | 'PUBLISHED' | 'CLOSED')[];
  }) => {
    const where: Prisma.AssignmentWhereInput = { deletedAt: null };
    if (args.classId) where.classId = args.classId;
    if (args.subjectId) where.subjectId = args.subjectId;
    if (args.termId) where.termId = args.termId;
    if (args.teacherId) where.teacherId = args.teacherId;
    if (args.status) where.status = args.status;
    if (args.statusIn) where.status = { in: args.statusIn };
    if (args.search) {
      where.OR = [
        { title: { contains: args.search, mode: 'insensitive' } },
        { instructions: { contains: args.search, mode: 'insensitive' } },
      ];
    }
    if (args.enrolledStudentId) {
      where.class = {
        enrollments: {
          some: { studentId: args.enrolledStudentId, isActive: true },
        },
      };
    }

    return Promise.all([
      prisma.assignment.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: [{ createdAt: 'desc' }],
        include: { ...includeFiles, ...includeRelations },
      }),
      prisma.assignment.count({ where }),
    ]);
  },

  create: (data: Prisma.AssignmentCreateInput) => prisma.assignment.create({ data }),

  update: (id: string, data: Prisma.AssignmentUpdateInput) =>
    prisma.assignment.update({ where: { id }, data }),

  softDelete: (id: string) =>
    prisma.assignment.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CLOSED' },
    }),
};