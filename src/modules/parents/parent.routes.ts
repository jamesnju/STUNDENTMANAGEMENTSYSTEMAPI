import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { paginationSchema } from '../../shared/utils/pagination';
import { parentController } from './parent.controller';
import { studentIdParamSchema } from './parent.schema';

const router = Router();
router.use(authenticate, authorize('PARENT'));

router.get('/me', asyncHandler(parentController.me));
router.get('/me/children', asyncHandler(parentController.children));
router.get(
  '/me/children/:studentId/timetable',
  validate({ params: studentIdParamSchema }),
  asyncHandler(parentController.childTimetable),
);
router.get(
  '/me/children/:studentId/notes',
  validate({ params: studentIdParamSchema, query: paginationSchema }),
  asyncHandler(parentController.childNotes),
);
router.get(
  '/me/children/:studentId/assignments',
  validate({ params: studentIdParamSchema, query: paginationSchema }),
  asyncHandler(parentController.childAssignments),
);

export default router;