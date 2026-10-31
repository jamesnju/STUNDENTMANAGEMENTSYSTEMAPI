import { Router } from 'express';
import { userController } from './user.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import {
  createUserSchema,
  listUsersSchema,
  idParamSchema,
  updateUserSchema,
} from './user.schema';
import { paginationSchema } from '../../shared/utils/pagination';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', validate({ query: listUsersSchema }), asyncHandler(userController.list));

router.get(
  '/archived',
  validate({ query: paginationSchema }),
  asyncHandler(userController.archived),
);

router.post('/', validate({ body: createUserSchema }), asyncHandler(userController.create));

router.get('/:id', validate({ params: idParamSchema }), asyncHandler(userController.get));

router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateUserSchema }),
  asyncHandler(userController.update),
);

router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(userController.remove),
);

router.post(
  '/:id/restore',
  validate({ params: idParamSchema }),
  asyncHandler(userController.restore),
);

export default router;