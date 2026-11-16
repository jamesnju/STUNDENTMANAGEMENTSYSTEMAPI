import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { roomController } from './room.controller';
import {
  createRoomSchema,
  updateRoomSchema,
  listRoomsSchema,
  idParamSchema,
} from './room.schema';

const router = Router();
router.use(authenticate);

// Any role can read rooms — needed by the timetable form dropdown
router.get('/', validate({ query: listRoomsSchema }), asyncHandler(roomController.list));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(roomController.get));

router.use(authorize('ADMIN'));
router.post('/', validate({ body: createRoomSchema }), asyncHandler(roomController.create));
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateRoomSchema }),
  asyncHandler(roomController.update),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(roomController.remove),
);

export default router;