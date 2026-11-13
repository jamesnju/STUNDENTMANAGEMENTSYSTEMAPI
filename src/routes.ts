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

export default router;