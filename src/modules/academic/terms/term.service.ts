import { Conflict, NotFound, BadRequest } from '../../../shared/errors/httpErrors';
import { prisma } from '../../../config/database';
import { termRepository } from './term.repository';

export const termService = {
  async create(input: {
    name: string;
    academicYear: string;
    startsAt: Date;
    endsAt: Date;
    isActive?: boolean;
  }) {
    const existing = await termRepository.findByNameYear(input.name, input.academicYear);
    if (existing) throw Conflict('Term already exists for this academic year');

    // Only one active term at a time
    if (input.isActive) {
      await prisma.$transaction(async (tx) => {
        await termRepository.deactivateAll();
        // done below
      });
    }

    return prisma.$transaction(async () => {
      if (input.isActive) await termRepository.deactivateAll();
      return termRepository.create({
        name: input.name,
        academicYear: input.academicYear,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        isActive: input.isActive ?? false,
      });
    });
  },

  async list(query: { skip: number; take: number; academicYear?: string; isActive?: boolean }) {
    const [items, total] = await termRepository.list(query);
    return { items, total };
  },

  async getById(id: string) {
    const term = await termRepository.findById(id);
    if (!term) throw NotFound('Term not found');
    return term;
  },

  async update(id: string, input: { name?: string; startsAt?: Date; endsAt?: Date; isActive?: boolean }) {
    const term = await termRepository.findById(id);
    if (!term) throw NotFound('Term not found');

    if (input.name && input.name !== term.name) {
      const existing = await termRepository.findByNameYear(input.name, term.academicYear);
      if (existing) throw Conflict('Term name already exists for this academic year');
    }
    if (input.startsAt && input.endsAt && input.endsAt <= input.startsAt) {
      throw BadRequest('endsAt must be after startsAt');
    }

    return prisma.$transaction(async () => {
      if (input.isActive === true) await termRepository.deactivateAll();
      return termRepository.update(id, input);
    });
  },

  async remove(id: string) {
    const term = await termRepository.findById(id);
    if (!term) throw NotFound('Term not found');

    // Block deletion if assignments/assessments reference it
    const [assignments, assessments] = await Promise.all([
      prisma.assignment.count({ where: { termId: id, deletedAt: null } }),
      prisma.assessment.count({ where: { termId: id, deletedAt: null } }),
    ]);
    if (assignments + assessments > 0) {
      throw Conflict(
        `Cannot delete term: ${assignments} assignment(s) and ${assessments} assessment(s) reference it.`,
      );
    }

    await prisma.term.delete({ where: { id } });
    return { id, deleted: true };
  },
};