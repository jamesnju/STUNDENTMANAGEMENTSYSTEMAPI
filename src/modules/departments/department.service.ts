import {
  BadRequest,
  Conflict,
  NotFound,
} from '../../shared/errors/httpErrors';
import { departmentRepository } from './department.repository';

export const departmentService = {
  async create(input: { name: string; code: string }) {
    const [byName, byCode] = await Promise.all([
      departmentRepository.findByName(input.name),
      departmentRepository.findByCode(input.code),
    ]);
    if (byName) throw Conflict('Department name already exists');
    if (byCode) throw Conflict('Department code already exists');
    return departmentRepository.create(input);
  },

  async list(query: {
    skip: number;
    take: number;
    search?: string;
    sortBy?: string;
    sortDir: 'asc' | 'desc';
  }) {
    const [items, total] = await departmentRepository.list(query);
    return { items, total };
  },

  async getById(id: string) {
    const dept = await departmentRepository.findById(id);
    if (!dept) throw NotFound('Department not found');
    const counts = await departmentRepository.countActiveMembers(id);
    return { ...dept, memberCounts: counts };
  },

  async update(id: string, input: { name?: string; code?: string }) {
    const dept = await departmentRepository.findById(id);
    if (!dept) throw NotFound('Department not found');

    if (input.name && input.name !== dept.name) {
      const existing = await departmentRepository.findByName(input.name);
      if (existing) throw Conflict('Department name already exists');
    }
    if (input.code && input.code !== dept.code) {
      const existing = await departmentRepository.findByCode(input.code);
      if (existing) throw Conflict('Department code already exists');
    }

    return departmentRepository.update(id, input);
  },

  /**
   * Hard-delete is only allowed when the department has no active members.
   * Soft-deleted (archived) teachers/students do NOT block deletion — the
   * department row is still referenced by their historical profile, so we
   * recommend archiving via a future `isArchived` field instead. For now,
   * deletion is blocked unless truly empty.
   */
  async remove(id: string) {
    const dept = await departmentRepository.findById(id);
    if (!dept) throw NotFound('Department not found');

    const counts = await departmentRepository.countActiveMembers(id);
    if (counts.total > 0) {
      throw Conflict(
        `Cannot delete department: ${counts.teacherCount} teacher(s) and ` +
          `${counts.studentCount} student(s) still active. ` +
          `Archive or reassign them first.`,
      );
    }

    // Even with no active members, archived profiles may still reference the
    // department. In production, prefer adding `isArchived` to Department
    // and blocking delete entirely once any member (active or archived) exists.
    const archivedTeacher = await prisma.teacher.count({ where: { departmentId: id } });
    const archivedStudent = await prisma.student.count({ where: { departmentId: id } });
    if (archivedTeacher + archivedStudent > 0) {
      throw BadRequest(
        'Department still referenced by archived teacher/student records. ' +
          'Historical data must be preserved.',
      );
    }

    await departmentRepository.delete(id);
    return { id, deleted: true };
  },

  /** Members listing (active only), paginated. */
  async listMembers(
    departmentId: string,
    query: { skip: number; take: number; role?: 'TEACHER' | 'STUDENT' },
  ) {
    const dept = await departmentRepository.findById(departmentId);
    if (!dept) throw NotFound('Department not found');

    const includeTeachers = !query.role || query.role === 'TEACHER';
    const includeStudents = !query.role || query.role === 'STUDENT';

    const [teachers, students, teacherTotal, studentTotal] = await Promise.all([
      includeTeachers
        ? prisma.teacher.findMany({
            where: { departmentId, deletedAt: null },
            skip: query.skip,
            take: query.take,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true, isActive: true } } },
          })
        : Promise.resolve([]),
      includeStudents
        ? prisma.student.findMany({
            where: { departmentId, deletedAt: null },
            skip: query.skip,
            take: query.take,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true, isActive: true } } },
          })
        : Promise.resolve([]),
      includeTeachers
        ? prisma.teacher.count({ where: { departmentId, deletedAt: null } })
        : Promise.resolve(0),
      includeStudents
        ? prisma.student.count({ where: { departmentId, deletedAt: null } })
        : Promise.resolve(0),
    ]);

    return { teachers, students, teacherTotal, studentTotal, department: dept };
  },
};

// Local import to keep the top-level imports clean
import { prisma } from '../../config/database';