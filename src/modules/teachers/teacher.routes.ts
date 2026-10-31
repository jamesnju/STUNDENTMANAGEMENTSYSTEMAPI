import { Router } from 'express';
import { teacherController } from './teacher.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { listStudentsSchema, studentIdParamSchema } from './teacher.schema';

const router = Router();

router.use(authenticate, authorize('TEACHER'));

router.get('/me', asyncHandler(teacherController.me));
router.get('/me/classes', asyncHandler(teacherController.myClasses));
router.get(
  '/me/students',
  validate({ query: listStudentsSchema }),
  asyncHandler(teacherController.myStudents),
);
router.get(
  '/me/students/:studentId',
  validate({ params: studentIdParamSchema }),
  asyncHandler(teacherController.myStudentById),
);

export default router;