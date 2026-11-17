import { Forbidden, NotFound } from '../../shared/errors/httpErrors';
import { parentRepository } from './parent.repository';

export const parentService = {
  async me(userId: string) {
    const parent = await parentRepository.findByUserId(userId);
    if (!parent) throw NotFound('Parent profile not found');
    const children = await parentRepository.listChildren(parent.id);
    return { ...parent, children };
  },

  async children(userId: string) {
    const parent = await parentRepository.findByUserId(userId);
    if (!parent) throw NotFound('Parent profile not found');
    return parentRepository.listChildren(parent.id);
  },

  async childTimetable(userId: string, studentId: string) {
    const parent = await parentRepository.findByUserId(userId);
    if (!parent) throw NotFound('Parent profile not found');
    const child = await parentRepository.findChildForParent(parent.id, studentId);
    if (!child) throw Forbidden('Not your child');
    return parentRepository.childTimetable(studentId);
  },

  async childNotes(userId: string, studentId: string, query: { skip: number; take: number }) {
    const parent = await parentRepository.findByUserId(userId);
    if (!parent) throw NotFound('Parent profile not found');
    const child = await parentRepository.findChildForParent(parent.id, studentId);
    if (!child) throw Forbidden('Not your child');
    const [items, total] = await parentRepository.childNotes(studentId, query);
    return { items, total };
  },

  async childAssignments(userId: string, studentId: string, query: { skip: number; take: number }) {
    const parent = await parentRepository.findByUserId(userId);
    if (!parent) throw NotFound('Parent profile not found');
    const child = await parentRepository.findChildForParent(parent.id, studentId);
    if (!child) throw Forbidden('Not your child');
    const [items, total] = await parentRepository.childAssignments(studentId, query);
    return { items, total };
  },
};