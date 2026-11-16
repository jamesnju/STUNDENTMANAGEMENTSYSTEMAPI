import { BadRequest, Conflict, NotFound } from '../../shared/errors/httpErrors';
import { prisma } from '../../config/database';
import { timetableRepository } from './timetable.repository';

export const timetableService = {
  async create(input: {
    classId: string;
    subjectId: string;
    teacherId: string;
    studentId?: string | null;
    dayOfWeek: number;
    period: number;
    startTime: string;
    endTime: string;
    room?: string;
  }) {
    const [cls, subject, teacher, assignment] = await Promise.all([
      prisma.class.findFirst({ where: { id: input.classId, deletedAt: null } }),
      prisma.subject.findFirst({ where: { id: input.subjectId, deletedAt: null } }),
      prisma.teacher.findFirst({ where: { id: input.teacherId, deletedAt: null } }),
      prisma.classSubject.findFirst({
        where: {
          classId: input.classId,
          subjectId: input.subjectId,
          teacherId: input.teacherId,
        },
        select: { id: true },
      }),
    ]);
    if (!cls) throw NotFound('Class not found');
    if (!subject) throw NotFound('Subject not found');
    if (!teacher) throw NotFound('Teacher not found');
    if (!assignment) {
      throw BadRequest(
        'This teacher is not assigned to this class+subject. Create the ClassSubject first.',
      );
    }

    const { classConflict, teacherConflict } = await timetableRepository.findConflicts({
      dayOfWeek: input.dayOfWeek,
      period: input.period,
      classId: input.classId,
      teacherId: input.teacherId,
    });
    if (classConflict) {
      throw Conflict('This class already has a slot at that day and period');
    }
    if (teacherConflict) {
      throw Conflict('This teacher already has a slot at that day and period');
    }

    return timetableRepository.create({
      class: { connect: { id: input.classId } },
      subject: { connect: { id: input.subjectId } },
      teacher: { connect: { id: input.teacherId } },
      student: input.studentId ? { connect: { id: input.studentId } } : undefined,
      dayOfWeek: input.dayOfWeek,
      period: input.period,
      startTime: input.startTime,
      endTime: input.endTime,
      room: input.room,
    });
  },

  async list(query: {
    skip: number;
    take: number;
    classId?: string;
    teacherId?: string;
    subjectId?: string;
    studentId?: string;
    dayOfWeek?: number;
  }) {
    const [items, total] = await timetableRepository.list(query);
    return { items, total };
  },

  async getById(id: string) {
    const slot = await timetableRepository.findById(id);
    if (!slot) throw NotFound('Slot not found');
    return slot;
  },

  async update(
    id: string,
    input: {
      subjectId?: string;
      teacherId?: string;
      studentId?: string | null;
      dayOfWeek?: number;
      period?: number;
      startTime?: string;
      endTime?: string;
      room?: string;
    },
  ) {
    const slot = await timetableRepository.findById(id);
    if (!slot) throw NotFound('Slot not found');

    const next = {
      dayOfWeek: input.dayOfWeek ?? slot.dayOfWeek,
      period: input.period ?? slot.period,
      classId: slot.classId,
      teacherId: input.teacherId ?? slot.teacherId,
      subjectId: input.subjectId ?? slot.subjectId,
    };

    if (input.subjectId || input.teacherId) {
      const assignment = await prisma.classSubject.findFirst({
        where: {
          classId: next.classId,
          subjectId: next.subjectId,
          teacherId: next.teacherId,
        },
        select: { id: true },
      });
      if (!assignment) {
        throw BadRequest('Teacher is not assigned to this class+subject combination');
      }
    }

    if (input.dayOfWeek !== undefined || input.period !== undefined || input.teacherId !== undefined) {
      const { classConflict, teacherConflict } = await timetableRepository.findConflicts({
        dayOfWeek: next.dayOfWeek,
        period: next.period,
        classId: next.classId,
        teacherId: next.teacherId,
        excludeId: id,
      });
      if (classConflict) throw Conflict('This class already has a slot at that day and period');
      if (teacherConflict) throw Conflict('This teacher already has a slot at that day and period');
    }

    const data: Record<string, unknown> = { ...input };
    if (input.studentId !== undefined) {
      data.student = input.studentId ? { connect: { id: input.studentId } } : { disconnect: true };
      delete data.studentId;
    }
    if (input.teacherId) { data.teacher = { connect: { id: input.teacherId } }; delete data.teacherId; }
    if (input.subjectId) { data.subject = { connect: { id: input.subjectId } }; delete data.subjectId; }

    return timetableRepository.update(id, data as never);
  },

  async remove(id: string) {
    const slot = await timetableRepository.findById(id);
    if (!slot) throw NotFound('Slot not found');
    await timetableRepository.delete(id);
    return { id, deleted: true };
  },
};