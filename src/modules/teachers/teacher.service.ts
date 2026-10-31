import { NotFound } from '../../shared/errors/httpErrors';
import { teacherRepository } from './teacher.repository';

export const teacherService = {
  async me(userId: string) {
    const teacher = await teacherRepository.findByUserId(userId);
    if (!teacher) throw NotFound('Teacher profile not found');
    return teacher;
  },

  async myClasses(userId: string) {
    const teacher = await teacherRepository.findByUserId(userId);
    if (!teacher) throw NotFound('Teacher profile not found');
    return teacherRepository.listClassesForTeacher(teacher.id);
  },

  async myStudents(
    userId: string,
    query: { skip: number; take: number; search?: string },
  ) {
    const teacher = await teacherRepository.findByUserId(userId);
    if (!teacher) throw NotFound('Teacher profile not found');
    const [items, total] = await teacherRepository.listStudentsForTeacher({
      teacherId: teacher.id,
      departmentId: teacher.departmentId,
      skip: query.skip,
      take: query.take,
      search: query.search,
    });
    return { items, total };
  },

  async myStudentById(userId: string, studentId: string) {
    const teacher = await teacherRepository.findByUserId(userId);
    if (!teacher) throw NotFound('Teacher profile not found');

    const student = await teacherRepository.findStudentInTeacherScope({
      studentId,
      teacherId: teacher.id,
      departmentId: teacher.departmentId,
    });
    if (!student) throw NotFound('Student not found in your scope');
    return student;
  },
};