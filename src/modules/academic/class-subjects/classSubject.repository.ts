import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database';

export const classSubjectRepository = {
  findById: (id: string) =>
    prisma.classSubject.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    }),

  findUnique: (classId: string, subjectId: string, teacherId: string) =>
    prisma.classSubject.findUnique({
      where: { classId_subjectId_teacherId: { classId, subjectId, teacherId } },
    }),

  list: (args: {
    skip: number;
    take: number;
    classId?: string;
    subjectId?: string;
    teacherId?: string;
  }) => {
    const where: Prisma.ClassSubjectWhereInput = {};
    if (args.classId) where.classId = args.classId;
    if (args.subjectId) where.subjectId = args.subjectId;
    if (args.teacherId) where.teacherId = args.teacherId;

    return Promise.all([
      prisma.classSubject.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: { createdAt: 'desc' },
        include: {
          class: { select: { id: true, name: true, code: true } },
          subject: { select: { id: true, name: true, code: true } },
          teacher: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.classSubject.count({ where }),
    ]);
  },

  create: (data: Prisma.ClassSubjectCreateInput) =>
    prisma.classSubject.create({ data }),

  delete: (id: string) => prisma.classSubject.delete({ where: { id } }),
};