import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { validate } from '../../../middlewares/validate';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { enrollmentController } from './enrollment.controller';
import {
  enrollSchema,
  bulkEnrollSchema,
  listEnrollmentsSchema,
  idParamSchema,
} from './enrollment.schema';

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/', validate({ query: listEnrollmentsSchema }), asyncHandler(enrollmentController.list));
router.post('/', validate({ body: enrollSchema }), asyncHandler(enrollmentController.enroll));
router.post(
  '/bulk',
  validate({ body: bulkEnrollSchema }),
  asyncHandler(enrollmentController.bulkEnroll),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(enrollmentController.withdraw),
);

export default router;