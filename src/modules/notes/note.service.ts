import { BadRequest, Forbidden, NotFound } from '../../shared/errors/httpErrors';
import { prisma } from '../../config/database';
import { attachFilesTo, detachFilesFrom } from '../../shared/utils/attachFiles';
import {
  requireTeacherProfile,
  assertTeacherOwnsClassSubject,
} from '../../shared/utils/guards';
import { noteRepository } from './note.repository';

type AuthUser = { id: string; role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' };

export const noteService = {
  async create(
    auth: AuthUser,
    input: {
      title: string;
      description?: string;
      classId?: string;
      subjectId?: string;
      fileIds?: string[];
      isPublished?: boolean;
    },
  ) {
    const teacher = await requireTeacherProfile(auth.id);

    // If a class+subject is provided, the teacher must be assigned to it.
    if (input.classId && input.subjectId) {
      await assertTeacherOwnsClassSubject(teacher.id, input.classId, input.subjectId);
    } else if (input.classId || input.subjectId) {
      // Half-specified — we allow it (drafting) but require both once published.
      if (input.isPublished) {
        throw BadRequest('classId and subjectId must be provided together to publish');
      }
    }

    const note = await noteRepository.create({
      title: input.title,
      description: input.description,
      teacher: { connect: { id: teacher.id } },
      class: input.classId ? { connect: { id: input.classId } } : undefined,
      subject: input.subjectId ? { connect: { id: input.subjectId } } : undefined,
      isPublished: input.isPublished ?? false,
      publishedAt: input.isPublished ? new Date() : null,
    });

    if (input.fileIds?.length) {
      await attachFilesTo(input.fileIds, 'noteId', note.id, auth.id);
    }

    return noteRepository.findById(note.id);
  },

  async list(auth: AuthUser, query: {
    skip: number;
    take: number;
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    published?: boolean;
    search?: string;
  }) {
    if (auth.role === 'ADMIN') {
      const [items, total] = await noteRepository.list(query);
      return { items, total };
    }

    if (auth.role === 'TEACHER') {
      const teacher = await requireTeacherProfile(auth.id);
      const [items, total] = await noteRepository.list({
        ...query,
        teacherId: teacher.id,
      });
      return { items, total };
    }

    if (auth.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: auth.id },
        select: { id: true },
      });
      if (!student) throw Forbidden('Student profile required');
      const [items, total] = await noteRepository.list({
        ...query,
        published: true,
        enrolledStudentId: student.id,
      });
      return { items, total };
    }

    throw Forbidden('Insufficient role');
  },

  async getById(auth: AuthUser, id: string) {
    const note = await noteRepository.findById(id);
    if (!note) throw NotFound('Note not found');

    // Access rules
    if (auth.role === 'ADMIN') return note;
    if (auth.role === 'TEACHER') {
      const teacher = await requireTeacherProfile(auth.id);
      if (note.teacherId !== teacher.id) throw Forbidden('Not your note');
      return note;
    }
    if (auth.role === 'STUDENT') {
      if (!note.isPublished) throw Forbidden('Note not published');
      const student = await prisma.student.findUnique({
        where: { userId: auth.id },
        select: { id: true },
      });
      if (!student) throw Forbidden();
      const enrolled = await prisma.classEnrollment.findFirst({
        where: { studentId: student.id, classId: note.classId ?? '__none__', isActive: true },
        select: { id: true },
      });
      if (!enrolled) throw Forbidden('Not enrolled in this class');
      return note;
    }
    throw Forbidden('Insufficient role');
  },

  async update(auth: AuthUser, id: string, input: {
    title?: string;
    description?: string | null;
    classId?: string | null;
    subjectId?: string | null;
    fileIds?: string[];
  }) {
    const note = await noteRepository.findById(id);
    if (!note) throw NotFound('Note not found');

    if (auth.role !== 'ADMIN') {
      const teacher = await requireTeacherProfile(auth.id);
      if (note.teacherId !== teacher.id) throw Forbidden('Not your note');
    }

    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.classId !== undefined) {
      data.class = input.classId ? { connect: { id: input.classId } } : { disconnect: true };
    }
    if (input.subjectId !== undefined) {
      data.subject = input.subjectId ? { connect: { id: input.subjectId } } : { disconnect: true };
    }

    const updated = await noteRepository.update(id, data as never);

    if (input.fileIds !== undefined) {
      // Replace all file attachments: detach old ones not in the new list, attach new ones.
      await detachFilesFrom('noteId', id);
      if (input.fileIds.length) {
        await attachFilesTo(input.fileIds, 'noteId', id, auth.id);
      }
    }

    return noteRepository.findById(updated.id);
  },

  async publish(auth: AuthUser, id: string) {
    const note = await noteRepository.findById(id);
    if (!note) throw NotFound('Note not found');
    if (auth.role !== 'ADMIN') {
      const teacher = await requireTeacherProfile(auth.id);
      if (note.teacherId !== teacher.id) throw Forbidden('Not your note');
    }
    if (!note.classId || !note.subjectId) {
      throw BadRequest('Note must have classId and subjectId before publishing');
    }
    if (note.isPublished) return note;

    return noteRepository.update(id, {
      isPublished: true,
      publishedAt: new Date(),
    });
  },

  async remove(auth: AuthUser, id: string) {
    const note = await noteRepository.findById(id);
    if (!note) throw NotFound('Note not found');
    if (auth.role !== 'ADMIN') {
      const teacher = await requireTeacherProfile(auth.id);
      if (note.teacherId !== teacher.id) throw Forbidden('Not your note');
    }
    await noteRepository.softDelete(id);
    return { id, deleted: true };
  },
};