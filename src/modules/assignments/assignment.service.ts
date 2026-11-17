import { BadRequest, Forbidden, NotFound } from '../../shared/errors/httpErrors';
import { prisma } from '../../config/database';
import { attachFilesTo, detachFilesFrom } from '../../shared/utils/attachFiles';
import {
  requireTeacherProfile,
  assertTeacherOwnsClassSubject,
} from '../../shared/utils/guards';
import { assignmentRepository } from './assignment.repository';

type AuthUser = { id: string; role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' };

export const assignmentService = {
  async create(auth: AuthUser, input: {
    title: string;
    instructions?: string;
    classId: string;
    subjectId: string;
    termId: string;
    dueAt?: Date | null;
    fileIds?: string[];
    isPublished?: boolean;
  }) {
    const teacher = await requireTeacherProfile(auth.id);
    await assertTeacherOwnsClassSubject(teacher.id, input.classId, input.subjectId);

    const [term, cls, subject] = await Promise.all([
      prisma.term.findUnique({ where: { id: input.termId }, select: { id: true } }),
      prisma.class.findFirst({ where: { id: input.classId, deletedAt: null }, select: { id: true } }),
      prisma.subject.findFirst({ where: { id: input.subjectId, deletedAt: null }, select: { id: true } }),
    ]);
    if (!term) throw NotFound('Term not found');
    if (!cls) throw NotFound('Class not found');
    if (!subject) throw NotFound('Subject not found');

    const now = new Date();
    if (input.dueAt && input.isPublished && input.dueAt <= now) {
      throw BadRequest('dueAt must be in the future when publishing');
    }

    const assignment = await assignmentRepository.create({
      title: input.title,
      instructions: input.instructions,
      class: { connect: { id: input.classId } },
      subject: { connect: { id: input.subjectId } },
      teacher: { connect: { id: teacher.id } },
      term: { connect: { id: input.termId } },
      dueAt: input.dueAt ?? null,
      status: input.isPublished ? 'PUBLISHED' : 'DRAFT',
      publishedAt: input.isPublished ? now : null,
    });

    if (input.fileIds?.length) {
      await attachFilesTo(input.fileIds, 'assignmentId', assignment.id, auth.id);
    }
    return assignmentRepository.findById(assignment.id);
  },

  async list(auth: AuthUser, query: {
    skip: number;
    take: number;
    classId?: string;
    subjectId?: string;
    termId?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
    search?: string;
  }) {
    if (auth.role === 'ADMIN') {
      const [items, total] = await assignmentRepository.list(query);
      return { items, total };
    }

    if (auth.role === 'TEACHER') {
      const teacher = await requireTeacherProfile(auth.id);
      const [items, total] = await assignmentRepository.list({ ...query, teacherId: teacher.id });
      return { items, total };
    }

    if (auth.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: auth.id },
        select: { id: true },
      });
      if (!student) throw Forbidden('Student profile required');
      const [items, total] = await assignmentRepository.list({
        ...query,
        enrolledStudentId: student.id,
        statusIn: ['PUBLISHED', 'CLOSED'], // never show DRAFT to students
      });
      return { items, total };
    }

    throw Forbidden('Insufficient role');
  },

  async getById(auth: AuthUser, id: string) {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw NotFound('Assignment not found');

    if (auth.role === 'ADMIN') return assignment;
    if (auth.role === 'TEACHER') {
      const teacher = await requireTeacherProfile(auth.id);
      if (assignment.teacherId !== teacher.id) throw Forbidden('Not your assignment');
      return assignment;
    }
    if (auth.role === 'STUDENT') {
      if (assignment.status === 'DRAFT') throw Forbidden('Assignment not published');
      const student = await prisma.student.findUnique({
        where: { userId: auth.id },
        select: { id: true },
      });
      if (!student) throw Forbidden();
      const enrolled = await prisma.classEnrollment.findFirst({
        where: { studentId: student.id, classId: assignment.classId, isActive: true },
        select: { id: true },
      });
      if (!enrolled) throw Forbidden('Not enrolled in this class');
      return assignment;
    }
    throw Forbidden('Insufficient role');
  },

  async update(auth: AuthUser, id: string, input: {
    title?: string;
    instructions?: string | null;
    dueAt?: Date | null;
    fileIds?: string[];
  }) {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw NotFound('Assignment not found');

    if (auth.role !== 'ADMIN') {
      const teacher = await requireTeacherProfile(auth.id);
      if (assignment.teacherId !== teacher.id) throw Forbidden('Not your assignment');
    }
    if (assignment.status === 'CLOSED') {
      throw BadRequest('Cannot edit a closed assignment');
    }

    if (input.dueAt !== undefined && input.dueAt !== null && assignment.status === 'PUBLISHED') {
      if (input.dueAt <= new Date()) throw BadRequest('dueAt must be in the future');
    }

    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.instructions !== undefined) data.instructions = input.instructions;
    if (input.dueAt !== undefined) data.dueAt = input.dueAt;

    const updated = await assignmentRepository.update(id, data as never);

    if (input.fileIds !== undefined) {
      await detachFilesFrom('assignmentId', id);
      if (input.fileIds.length) {
        await attachFilesTo(input.fileIds, 'assignmentId', id, auth.id);
      }
    }
    return assignmentRepository.findById(updated.id);
  },

  async publish(auth: AuthUser, id: string) {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw NotFound('Assignment not found');

    if (auth.role !== 'ADMIN') {
      const teacher = await requireTeacherProfile(auth.id);
      if (assignment.teacherId !== teacher.id) throw Forbidden('Not your assignment');
    }
    if (assignment.status !== 'DRAFT') return assignment;
    if (assignment.dueAt && assignment.dueAt <= new Date()) {
      throw BadRequest('Cannot publish an assignment whose dueAt is in the past');
    }

    return assignmentRepository.update(id, {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    });
  },

  async close(auth: AuthUser, id: string) {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw NotFound('Assignment not found');

    if (auth.role !== 'ADMIN') {
      const teacher = await requireTeacherProfile(auth.id);
      if (assignment.teacherId !== teacher.id) throw Forbidden('Not your assignment');
    }
    if (assignment.status === 'CLOSED') return assignment;
    return assignmentRepository.update(id, { status: 'CLOSED' });
  },

  async remove(auth: AuthUser, id: string) {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw NotFound('Assignment not found');

    if (auth.role !== 'ADMIN') {
      const teacher = await requireTeacherProfile(auth.id);
      if (assignment.teacherId !== teacher.id) throw Forbidden('Not your assignment');
    }
    await assignmentRepository.softDelete(id);
    return { id, deleted: true };
  },
  async addFile(auth: AuthUser, assignmentId: string, fileId: string) {
  const assignment = await assignmentRepository.findById(assignmentId);
  if (!assignment) throw NotFound('Assignment not found');
  if (auth.role !== 'ADMIN') {
    const teacher = await requireTeacherProfile(auth.id);
    if (assignment.teacherId !== teacher.id) throw Forbidden('Not your assignment');
  }
  await attachFilesTo([fileId], 'assignmentId', assignmentId, auth.id);
  return assignmentRepository.findById(assignmentId);
},

async removeFile(auth: AuthUser, assignmentId: string, fileId: string) {
  const assignment = await assignmentRepository.findById(assignmentId);
  if (!assignment) throw NotFound('Assignment not found');
  if (auth.role !== 'ADMIN') {
    const teacher = await requireTeacherProfile(auth.id);
    if (assignment.teacherId !== teacher.id) throw Forbidden('Not your assignment');
  }
  await detachFilesFrom('assignmentId', assignmentId, [fileId]);
  return assignmentRepository.findById(assignmentId);
},
};