import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { validate } from '../../../middlewares/validate';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { classController } from './class.controller';
import {
  createClassSchema,
  updateClassSchema,
  listClassesSchema,
  idParamSchema,
} from './class.schema';

const router = Router();
router.use(authenticate);

router.get('/', validate({ query: listClassesSchema }), asyncHandler(classController.list));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(classController.get));

router.use(authorize('ADMIN'));
router.post('/', validate({ body: createClassSchema }), asyncHandler(classController.create));
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateClassSchema }),
  asyncHandler(classController.update),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(classController.remove),
);

export default router;