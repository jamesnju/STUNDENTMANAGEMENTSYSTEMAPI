import Router from 'express';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import departmentRoutes from './modules/departments/department.routes';
import settingsRoutes from './modules/settings/settings.routes';
import teacherRoutes from './modules/teachers/teacher.routes';
import studentRoutes from './modules/students/student.routes';
import fileRoutes from './modules/files/file.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import jobsRoutes from './modules/jobs/jobs.routes';
import timetableRoutes from './modules/timetable/timetable.routes';

import termsRoutes from './modules/academic/terms/term.routes';
import subjectsRoutes from './modules/academic/subjects/subject.routes';
import classesRoutes from './modules/academic/classes/class.routes';
import classSubjectsRoutes from './modules/academic/class-subjects/classSubject.routes';
import enrollmentsRoutes from './modules/academic/enrollments/enrollment.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, data: 'ok' }));

router.use('/auth', authRoutes);
router.use('/admin/users', userRoutes);
router.use('/admin/departments', departmentRoutes);
router.use('/admin/settings', settingsRoutes);
router.use('/admin/jobs', jobsRoutes);
router.use('/files', fileRoutes);
router.use('/notifications', notificationRoutes);
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/admin/academic/terms', termsRoutes);
router.use('/admin/academic/subjects', subjectsRoutes);
router.use('/admin/academic/classes', classesRoutes);
router.use('/admin/academic/class-subjects', classSubjectsRoutes);
router.use('/admin/academic/enrollments', enrollmentsRoutes);
router.use('/timetable', timetableRoutes);

export default router;