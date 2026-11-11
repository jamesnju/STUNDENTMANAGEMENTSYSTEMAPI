import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/shared/utils/password';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@school.local';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword('Admin@12345'),
        role: Role.ADMIN,
      },
    });
    console.log('Admin created:', adminEmail, 'password: Admin@12345');
  }

  const defaults = [
    { param: 'academic.current_term', valString: '2026-Term1', description: 'Active academic term' },
    { param: 'grading.pass_mark', valInt: 50, description: 'Minimum passing grade' },
    { param: 'attendance.late_threshold_minutes', valInt: 15, description: 'Minutes after start = late' },
    { param: 'feature.parent_portal_enabled', valBool: true, description: 'Enable parent portal' },
    { param: 'notification.email_enabled', valBool: true, description: 'Send email notifications' },
  ];
  for (const s of defaults) {
    await prisma.appSetting.upsert({ where: { param: s.param }, create: s, update: {} });
  }

  const deptDefaults = [
    { name: 'Science', code: 'SCI' },
    { name: 'Arts', code: 'ART' },
    { name: 'Administration', code: 'ADM' },
  ];
  for (const d of deptDefaults) {
    await prisma.department.upsert({
      where: { code: d.code },
      create: d,
      update: {},
    });
  }
  console.log('Departments seeded:', deptDefaults.map((d) => d.code).join(', '));

  const extraSettings = [
    { param: 'academic.school_name', valString: 'Green Valley Academy', description: 'School display name' },
    { param: 'academic.timezone', valString: 'Africa/Nairobi', description: 'School timezone' },
    { param: 'attendance.marking_window_hours', valInt: 24, description: 'How long after a class ends attendance can be edited' },
    { param: 'grading.max_score', valInt: 100, description: 'Maximum score per assessment' },
  ];
  for (const s of extraSettings) {
    await prisma.appSetting.upsert({ where: { param: s.param }, create: s, update: {} });
  }

  // Add a demo class, subject, and enrollment so /me endpoints return data.
  const sci = await prisma.department.findUnique({ where: { code: 'SCI' } });
  if (sci) {
    const demoTeacher = await prisma.teacher.findFirst({
      where: { departmentId: sci.id, deletedAt: null },
    });
    if (demoTeacher) {
      const math = await prisma.subject.upsert({
        where: { code: 'MATH' },
        create: { name: 'Mathematics', code: 'MATH', departmentId: sci.id },
        update: {},
      });

      const form1 = await prisma.class.upsert({
        where: { code_academicYear: { code: 'F1A', academicYear: '2026' } },
        create: {
          name: 'Form 1A',
          code: 'F1A',
          academicYear: '2026',
          departmentId: sci.id,
          classTeacherId: demoTeacher.id,
        },
        update: {},
      });

      await prisma.classSubject.upsert({
        where: {
          classId_subjectId_teacherId: {
            classId: form1.id,
            subjectId: math.id,
            teacherId: demoTeacher.id,
          },
        },
        create: { classId: form1.id, subjectId: math.id, teacherId: demoTeacher.id },
        update: {},
      });

      console.log('Demo class F1A, subject MATH, class-subject link created');
    }
  }
}

main().finally(() => prisma.$disconnect());