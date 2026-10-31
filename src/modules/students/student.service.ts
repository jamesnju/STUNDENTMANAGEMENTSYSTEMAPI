import { NotFound } from '../../shared/errors/httpErrors';
import { studentRepository } from './student.repository';

export const studentService = {
  async me(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) throw NotFound('Student profile not found');
    return student;
  },

  async myClasses(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) throw NotFound('Student profile not found');
    return studentRepository.listMyClasses(student.id);
  },

  async myTimetable(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) throw NotFound('Student profile not found');
    return studentRepository.listMyTimetable(student.id);
  },

  async myClassmates(userId: string, query: { skip: number; take: number }) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) throw NotFound('Student profile not found');
    const items = await studentRepository.listMyClassmates({
      studentId: student.id,
      skip: query.skip,
      take: query.take,
    });
    return { items };
  },
};