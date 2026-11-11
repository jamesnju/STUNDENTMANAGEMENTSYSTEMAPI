import { prisma } from "../../config/database";
import { Forbidden } from "../../shared/errors/httpErrors";

// modules/assignments/assignment.guards.ts
export const assertTeacherOwnsClassSubject = async (teacherUserId: string, classId: string, subjectId: string) => {
  const teacher = await prisma.teacher.findUnique({ where: { userId: teacherUserId } });
  if (!teacher) throw Forbidden();
  const teaches = await prisma.classSubject.findFirst({ where: { classId, subjectId, teacherId: teacher.id } });
  if (!teaches) throw Forbidden('You do not teach this class/subject');
  return teacher;
};

export const assertStudentEnrolled = async (studentUserId: string, classId: string) => {
  const student = await prisma.student.findUnique({ where: { userId: studentUserId } });
  if (!student) throw Forbidden();
  const enrolled = await prisma.classEnrollment.findFirst({
    where: { studentId: student.id, classId, isActive: true },
  });
  if (!enrolled) throw Forbidden('Not enrolled in this class');
  return student;
};