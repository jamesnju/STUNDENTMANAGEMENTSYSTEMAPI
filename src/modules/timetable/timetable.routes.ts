import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { timetableController } from './timetable.controller';
import {
  createSlotSchema,
  updateSlotSchema,
  listSlotsSchema,
  idParamSchema,
} from './timetable.schema';

const router = Router();
router.use(authenticate);

router.get('/', validate({ query: listSlotsSchema }), asyncHandler(timetableController.list));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(timetableController.get));

router.use(authorize('ADMIN'));
router.post('/', validate({ body: createSlotSchema }), asyncHandler(timetableController.create));
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateSlotSchema }),
  asyncHandler(timetableController.update),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(timetableController.remove),
);

export default router;