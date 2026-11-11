import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { paginationSchema } from '../../shared/utils/pagination';
import { jobsController } from './jobs.controller';
import { jobNameParamSchema, runJobBodySchema } from './jobs.schema';

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/', asyncHandler(jobsController.list));

router.get(
  '/history',
  validate({ query: paginationSchema }),
  asyncHandler(jobsController.history),
);

router.post(
  '/:jobName/run',
  validate({ params: jobNameParamSchema, body: runJobBodySchema }),
  asyncHandler(jobsController.run),
);

export default router;