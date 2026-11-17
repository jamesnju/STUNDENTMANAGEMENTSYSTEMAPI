import { prisma } from '../../config/database';
import { Forbidden, NotFound } from '../errors/httpErrors';

/** Ensure the given User.id corresponds to a live Teacher, return the Teacher row. */
export async function requireTeacherProfile(userId: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    select: { id: true, departmentId: true, deletedAt: true },
  });
  if (!teacher || teacher.deletedAt) throw Forbidden('Teacher profile required');
  return teacher;
}

/** Ensure the given User.id corresponds to a live Student, return the Student row. */
export async function requireStudentProfile(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true, departmentId: true, deletedAt: true },
  });
  if (!student || student.deletedAt) throw Forbidden('Student profile required');
  return student;
}

/** Assert this teacher teaches (class, subject) via ClassSubject, or 403. */
export async function assertTeacherOwnsClassSubject(
  teacherId: string,
  classId: string,
  subjectId: string,
) {
  const link = await prisma.classSubject.findFirst({
    where: { teacherId, classId, subjectId },
    select: { id: true },
  });
  if (!link) throw Forbidden('You do not teach this class+subject');
}

/** Assert this student is actively enrolled in the class, or 403. */
export async function assertStudentEnrolled(studentId: string, classId: string) {
  const enrollment = await prisma.classEnrollment.findFirst({
    where: { studentId, classId, isActive: true },
    select: { id: true },
  });
  if (!enrollment) throw Forbidden('You are not enrolled in this class');
}