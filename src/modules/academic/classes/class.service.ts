import { Conflict, NotFound, BadRequest } from '../../../shared/errors/httpErrors';
import { prisma } from '../../../config/database';
import { classRepository } from './class.repository';

export const classService = {
  async create(input: {
    name: string;
    code: string;
    academicYear: string;
    departmentId: string;
    classTeacherId?: string | null;
  }) {
    const [dept, dup] = await Promise.all([
      prisma.department.findUnique({ where: { id: input.departmentId } }),
      classRepository.findByCodeYear(input.code, input.academicYear),
    ]);
    if (!dept) throw NotFound('Department not found');
    if (dup) throw Conflict('A class with this code already exists for this academic year');

    if (input.classTeacherId) {
      const t = await prisma.teacher.findUnique({ where: { id: input.classTeacherId } });
      if (!t || t.deletedAt) throw NotFound('Class teacher not found');
    }

    return classRepository.create({
      name: input.name,
      code: input.code,
      academicYear: input.academicYear,
      department: { connect: { id: input.departmentId } },
      classTeacher: input.classTeacherId
        ? { connect: { id: input.classTeacherId } }
        : undefined,
    });
  },

  async list(query: {
    skip: number;
    take: number;
    search?: string;
    departmentId?: string;
    academicYear?: string;
    isActive?: boolean;
  }) {
    const [items, total] = await classRepository.list(query);
    return { items, total };
  },

  async getById(id: string) {
    const cls = await classRepository.findById(id);
    if (!cls) throw NotFound('Class not found');
    return cls;
  },

  async update(
    id: string,
    input: {
      name?: string;
      code?: string;
      classTeacherId?: string | null;
      isActive?: boolean;
    },
  ) {
    const cls = await classRepository.findById(id);
    if (!cls) throw NotFound('Class not found');

    if (input.code && input.code !== cls.code) {
      const dup = await classRepository.findByCodeYear(input.code, cls.academicYear);
      if (dup) throw Conflict('A class with this code already exists for this academic year');
    }

    if (input.classTeacherId) {
      const t = await prisma.teacher.findUnique({ where: { id: input.classTeacherId } });
      if (!t || t.deletedAt) throw NotFound('Class teacher not found');
    }

    const data: Record<string, unknown> = { ...input };
    if (input.classTeacherId !== undefined) {
      data.classTeacher = input.classTeacherId
        ? { connect: { id: input.classTeacherId } }
        : { disconnect: true };
      delete data.classTeacherId;
    }

    return classRepository.update(id, data as never);
  },

  async remove(id: string) {
    const cls = await classRepository.findById(id);
    if (!cls) throw NotFound('Class not found');

    const [enrollments, classSubjects, timetables] = await Promise.all([
      prisma.classEnrollment.count({ where: { classId: id, isActive: true } }),
      prisma.classSubject.count({ where: { classId: id } }),
      prisma.timetableSlot.count({ where: { classId: id } }),
    ]);
    if (enrollments + classSubjects + timetables > 0) {
      throw BadRequest(
        `Cannot delete class: ${enrollments} active enrollment(s), ${classSubjects} subject assignment(s), ${timetables} timetable slot(s) still reference it.`,
      );
    }

    await classRepository.softDelete(id);
    return { id, deleted: true };
  },
};