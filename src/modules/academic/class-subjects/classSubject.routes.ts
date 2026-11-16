import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { validate } from '../../../middlewares/validate';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { classSubjectController } from './classSubject.controller';
import {
  createClassSubjectSchema,
  listClassSubjectsSchema,
  idParamSchema,
} from './classSubject.schema';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  validate({ query: listClassSubjectsSchema }),
  asyncHandler(classSubjectController.list),
);

router.use(authorize('ADMIN'));
router.post(
  '/',
  validate({ body: createClassSubjectSchema }),
  asyncHandler(classSubjectController.create),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(classSubjectController.remove),
);

export default router;