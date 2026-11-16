import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { validate } from '../../../middlewares/validate';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { subjectController } from './subject.controller';
import {
  createSubjectSchema,
  updateSubjectSchema,
  listSubjectsSchema,
  idParamSchema,
} from './subject.schema';

const router = Router();
router.use(authenticate);

router.get('/', validate({ query: listSubjectsSchema }), asyncHandler(subjectController.list));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(subjectController.get));

router.use(authorize('ADMIN'));
router.post('/', validate({ body: createSubjectSchema }), asyncHandler(subjectController.create));
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateSubjectSchema }),
  asyncHandler(subjectController.update),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(subjectController.remove),
);

export default router;