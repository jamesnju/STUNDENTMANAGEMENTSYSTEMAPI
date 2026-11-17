import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database';

const includeFiles = {
  files: {
    select: { id: true, url: true, publicName: true, originalName: true, mimeType: true, bytes: true },
  },
} as unknown as Prisma.SubmissionInclude;

// Note: `publicName` isn't a File field; drop it in the actual call:
const includeFilesReal = {
  files: {
    select: { id: true, url: true, publicId: true, originalName: true, mimeType: true, bytes: true, format: true },
  },
} satisfies Prisma.SubmissionInclude;

const includeRelations = {
  student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
  gradedBy: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.SubmissionInclude;

export const submissionRepository = {
  findById: (id: string) =>
    prisma.submission.findUnique({
      where: { id },
      include: { ...includeFilesReal, ...includeRelations },
    }),

  findForStudent: (assignmentId: string, studentId: string) =>
    prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
      include: { ...includeFilesReal, ...includeRelations },
    }),

  listForAssignment: (args: {
    assignmentId: string;
    skip: number;
    take: number;
    status?: 'ungraded' | 'graded';
  }) => {
    const where: Prisma.SubmissionWhereInput = { assignmentId: args.assignmentId };
    if (args.status === 'graded') where.gradedAt = { not: null };
    if (args.status === 'ungraded') where.gradedAt = null;

    return Promise.all([
      prisma.submission.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: [{ submittedAt: 'desc' }],
        include: { ...includeFilesReal, ...includeRelations },
      }),
      prisma.submission.count({ where }),
    ]);
  },

  create: (data: Prisma.SubmissionCreateInput) => prisma.submission.create({ data }),

  update: (id: string, data: Prisma.SubmissionUpdateInput) =>
    prisma.submission.update({ where: { id }, data }),
};