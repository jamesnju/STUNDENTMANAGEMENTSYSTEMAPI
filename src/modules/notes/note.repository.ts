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
} satisfies Prisma.NoteInclude;

const includeRelations = {
  teacher: { select: { id: true, firstName: true, lastName: true } },
  class: { select: { id: true, name: true, code: true } },
  subject: { select: { id: true, name: true, code: true } },
} satisfies Prisma.NoteInclude;

export const noteRepository = {
  findById: (id: string) =>
    prisma.note.findFirst({
      where: { id, deletedAt: null },
      include: { ...includeFiles, ...includeRelations },
    }),

  list: (args: {
    skip: number;
    take: number;
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    published?: boolean;
    search?: string;
    /** When set, only return notes in classes this student is enrolled in. */
    enrolledStudentId?: string;
  }) => {
    const where: Prisma.NoteWhereInput = { deletedAt: null };
    if (args.classId) where.classId = args.classId;
    if (args.subjectId) where.subjectId = args.subjectId;
    if (args.teacherId) where.teacherId = args.teacherId;
    if (args.published !== undefined) where.isPublished = args.published;
    if (args.search) {
      where.OR = [
        { title: { contains: args.search, mode: 'insensitive' } },
        { description: { contains: args.search, mode: 'insensitive' } },
      ];
    }
    if (args.enrolledStudentId) {
      where.isPublished = true;
      where.class = {
        enrollments: {
          some: { studentId: args.enrolledStudentId, isActive: true },
        },
      };
    }

    return Promise.all([
      prisma.note.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: { createdAt: 'desc' },
        include: { ...includeFiles, ...includeRelations },
      }),
      prisma.note.count({ where }),
    ]);
  },

  create: (data: Prisma.NoteCreateInput) => prisma.note.create({ data }),

  update: (id: string, data: Prisma.NoteUpdateInput) =>
    prisma.note.update({ where: { id }, data }),

  softDelete: (id: string) =>
    prisma.note.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    }),
};