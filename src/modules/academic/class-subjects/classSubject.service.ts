import { Conflict, NotFound } from '../../../shared/errors/httpErrors';
import { prisma } from '../../../config/database';
import { classSubjectRepository } from './classSubject.repository';

export const classSubjectService = {
  async create(input: { classId: string; subjectId: string; teacherId: string }) {
    const [cls, subject, teacher, dup] = await Promise.all([
      prisma.class.findFirst({ where: { id: input.classId, deletedAt: null } }),
      prisma.subject.findFirst({ where: { id: input.subjectId, deletedAt: null } }),
      prisma.teacher.findFirst({ where: { id: input.teacherId, deletedAt: null } }),
      classSubjectRepository.findUnique(input.classId, input.subjectId, input.teacherId),
    ]);
    if (!cls) throw NotFound('Class not found');
    if (!subject) throw NotFound('Subject not found');
    if (!teacher) throw NotFound('Teacher not found');
    if (dup) throw Conflict('This class+subject+teacher assignment already exists');

    return classSubjectRepository.create({
      class: { connect: { id: input.classId } },
      subject: { connect: { id: input.subjectId } },
      teacher: { connect: { id: input.teacherId } },
    });
  },

  async list(query: {
    skip: number;
    take: number;
    classId?: string;
    subjectId?: string;
    teacherId?: string;
  }) {
    const [items, total] = await classSubjectRepository.list(query);
    return { items, total };
  },

  async remove(id: string) {
    const cs = await classSubjectRepository.findById(id);
    if (!cs) throw NotFound('Assignment not found');

    // Do not allow removing if timetable slots exist for (class, subject, teacher)
    const used = await prisma.timetableSlot.count({
      where: { classId: cs.classId, subjectId: cs.subjectId, teacherId: cs.teacherId },
    });
    if (used > 0) {
      throw Conflict(
        `Cannot remove: ${used} timetable slot(s) reference this class+subject+teacher.`,
      );
    }

    await classSubjectRepository.delete(id);
    return { id, deleted: true };
  },
};