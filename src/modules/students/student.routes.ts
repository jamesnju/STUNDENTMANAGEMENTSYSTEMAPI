import { Router } from 'express';
import { studentController } from './student.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { validate } from '../../middlewares/validate';
import { paginationSchema } from '../../shared/utils/pagination';
import { myAssignmentsQuerySchema } from './student.schema';

const router = Router();

router.use(authenticate, authorize('STUDENT'));

router.get('/me', asyncHandler(studentController.me));
router.get('/me/classes', asyncHandler(studentController.myClasses));
router.get('/me/timetable', asyncHandler(studentController.myTimetable));
router.get(
  '/me/classmates',
  validate({ query: paginationSchema }),
  asyncHandler(studentController.myClassmates),
);
router.get(
  '/me/notes',
  validate({ query: paginationSchema }),
  asyncHandler(studentController.myNotes),
);
router.get(
  '/me/assignments',
  validate({ query: myAssignmentsQuerySchema }),
  asyncHandler(studentController.myAssignments),
);

export default router;