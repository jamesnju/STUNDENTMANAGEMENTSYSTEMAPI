import { Router } from 'express';
import { departmentController } from './department.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  listDepartmentsSchema,
  idParamSchema,
} from './department.schema';
import { paginationSchema } from '../../shared/utils/pagination';
import { z } from 'zod';

const membersQuerySchema = paginationSchema.extend({
  role: z.enum(['TEACHER', 'STUDENT']).optional(),
});

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get(
  '/',
  validate({ query: listDepartmentsSchema }),
  asyncHandler(departmentController.list),
);

router.post(
  '/',
  validate({ body: createDepartmentSchema }),
  asyncHandler(departmentController.create),
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(departmentController.get),
);

router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateDepartmentSchema }),
  asyncHandler(departmentController.update),
);

router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(departmentController.remove),
);

router.get(
  '/:id/members',
  validate({ params: idParamSchema, query: membersQuerySchema }),
  asyncHandler(departmentController.members),
);

export default router;