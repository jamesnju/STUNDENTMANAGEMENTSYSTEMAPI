import { Conflict, NotFound } from '../../../shared/errors/httpErrors';
import { prisma } from '../../../config/database';
import { subjectRepository } from './subject.repository';

export const subjectService = {
  async create(input: { name: string; code: string; departmentId: string }) {
    const [byCode, dept] = await Promise.all([
      subjectRepository.findByCode(input.code),
      prisma.department.findUnique({ where: { id: input.departmentId } }),
    ]);
    if (byCode) throw Conflict('Subject code already exists');
    if (!dept) throw NotFound('Department not found');

    return subjectRepository.create({
      name: input.name,
      code: input.code,
      department: { connect: { id: input.departmentId } },
    });
  },

  async list(query: {
    skip: number;
    take: number;
    search?: string;
    departmentId?: string;
    isActive?: boolean;
  }) {
    const [items, total] = await subjectRepository.list(query);
    return { items, total };
  },

  async getById(id: string) {
    const subject = await subjectRepository.findById(id);
    if (!subject) throw NotFound('Subject not found');
    return subject;
  },

  async update(
    id: string,
    input: { name?: string; code?: string; departmentId?: string; isActive?: boolean },
  ) {
    const subject = await subjectRepository.findById(id);
    if (!subject) throw NotFound('Subject not found');

    if (input.code && input.code !== subject.code) {
      const existing = await subjectRepository.findByCode(input.code);
      if (existing) throw Conflict('Subject code already exists');
    }

    const data: Record<string, unknown> = { ...input };
    if (input.departmentId) {
      data.department = { connect: { id: input.departmentId } };
      delete data.departmentId;
    }

    return subjectRepository.update(id, data as never);
  },

  async remove(id: string) {
    const subject = await subjectRepository.findById(id);
    if (!subject) throw NotFound('Subject not found');

    const activeClasses = await prisma.classSubject.count({
      where: { subjectId: id, class: { deletedAt: null } },
    });
    if (activeClasses > 0) {
      throw Conflict(
        `Cannot delete subject: referenced by ${activeClasses} class(es). Archive them first.`,
      );
    }

    await subjectRepository.softDelete(id);
    return { id, deleted: true };
  },
};