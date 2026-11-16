import { BadRequest, Conflict, NotFound } from '../../../shared/errors/httpErrors';
import { prisma } from '../../../config/database';
import { enrollmentRepository } from './enrollment.repository';

export const enrollmentService = {
  async enroll(input: { classId: string; studentId: string; term: string }) {
    const [cls, student, dup] = await Promise.all([
      prisma.class.findFirst({ where: { id: input.classId, deletedAt: null } }),
      prisma.student.findFirst({ where: { id: input.studentId, deletedAt: null } }),
      enrollmentRepository.findUnique(input.classId, input.studentId, input.term),
    ]);
    if (!cls) throw NotFound('Class not found');
    if (!student) throw NotFound('Student not found');
    if (dup) {
      if (!dup.isActive) {
        // Reactivate
        return prisma.classEnrollment.update({
          where: { id: dup.id },
          data: { isActive: true },
        });
      }
      throw Conflict('Student already enrolled in this class for this term');
    }

    return enrollmentRepository.create({
      class: { connect: { id: input.classId } },
      student: { connect: { id: input.studentId } },
      term: input.term,
    });
  },

  async bulkEnroll(input: { classId: string; term: string; studentIds: string[] }) {
    const cls = await prisma.class.findFirst({ where: { id: input.classId, deletedAt: null } });
    if (!cls) throw NotFound('Class not found');

    const uniqueIds = Array.from(new Set(input.studentIds));

    const students = await prisma.student.findMany({
      where: { id: { in: uniqueIds }, deletedAt: null },
      select: { id: true },
    });
    const found = new Set(students.map((s) => s.id));
    const missing = uniqueIds.filter((id) => !found.has(id));
    if (missing.length) throw BadRequest(`Unknown student IDs: ${missing.join(', ')}`);

    const existing = await prisma.classEnrollment.findMany({
      where: { classId: input.classId, term: input.term, studentId: { in: uniqueIds } },
      select: { studentId: true },
    });
    const alreadyEnrolled = new Set(existing.map((e) => e.studentId));
    const toCreate = uniqueIds.filter((id) => !alreadyEnrolled.has(id));

    if (toCreate.length === 0) {
      return { created: 0, skipped: uniqueIds.length };
    }

    const result = await prisma.classEnrollment.createMany({
      data: toCreate.map((studentId) => ({
        classId: input.classId,
        studentId,
        term: input.term,
        isActive: true,
      })),
      skipDuplicates: true,
    });

    return {
      created: result.count,
      skipped: uniqueIds.length - result.count,
    };
  },

  async list(query: {
    skip: number;
    take: number;
    classId?: string;
    studentId?: string;
    term?: string;
    isActive?: boolean;
  }) {
    const [items, total] = await enrollmentRepository.list(query);
    return { items, total };
  },

  async withdraw(id: string) {
    const enrollment = await enrollmentRepository.findById(id);
    if (!enrollment) throw NotFound('Enrollment not found');
    if (!enrollment.isActive) return { id, isActive: false };
    await enrollmentRepository.deactivate(id);
    return { id, isActive: false };
  },
};