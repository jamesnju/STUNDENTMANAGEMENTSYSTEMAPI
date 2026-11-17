import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { noteController } from './note.controller';
import {
  createNoteSchema,
  updateNoteSchema,
  listNotesSchema,
  idParamSchema,
} from './note.schema';

const router = Router();
router.use(authenticate);

router.get('/', validate({ query: listNotesSchema }), asyncHandler(noteController.list));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(noteController.get));

router.use(authorize('ADMIN', 'TEACHER'));
router.post('/', validate({ body: createNoteSchema }), asyncHandler(noteController.create));
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateNoteSchema }),
  asyncHandler(noteController.update),
);
router.post(
  '/:id/publish',
  validate({ params: idParamSchema }),
  asyncHandler(noteController.publish),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(noteController.remove),
);

export default router;