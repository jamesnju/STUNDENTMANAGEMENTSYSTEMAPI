import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { assignmentController } from './assignment.controller';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  listAssignmentsSchema,
  idParamSchema,
  fileIdParamSchema,
  addFileSchema,
} from './assignment.schema';

const router = Router();
router.use(authenticate);

router.get('/', validate({ query: listAssignmentsSchema }), asyncHandler(assignmentController.list));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(assignmentController.get));

router.use(authorize('ADMIN', 'TEACHER'));
router.post('/', validate({ body: createAssignmentSchema }), asyncHandler(assignmentController.create));
router.patch('/:id', validate({ params: idParamSchema, body: updateAssignmentSchema }), asyncHandler(assignmentController.update));
router.post('/:id/publish', validate({ params: idParamSchema }), asyncHandler(assignmentController.publish));
router.post('/:id/close', validate({ params: idParamSchema }), asyncHandler(assignmentController.close));
router.delete('/:id', validate({ params: idParamSchema }), asyncHandler(assignmentController.remove));
router.post(
  '/:id/files',
  validate({ params: idParamSchema, body: addFileSchema }),
  asyncHandler(assignmentController.addFile),
);
router.delete(
  '/:id/files/:fileId',
  validate({ params: fileIdParamSchema }),
  asyncHandler(assignmentController.removeFile),
);
export default router;