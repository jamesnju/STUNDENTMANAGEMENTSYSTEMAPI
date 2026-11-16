import { Router } from 'express';
import { authenticate } from '../../../middlewares/authenticate';
import { authorize } from '../../../middlewares/authorize';
import { validate } from '../../../middlewares/validate';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { termController } from './term.controller';
import {
  createTermSchema,
  updateTermSchema,
  listTermsSchema,
  idParamSchema,
} from './term.schema';

const router = Router();
router.use(authenticate);

// List — any role can read terms (needed to pick active term in UI)
router.get('/', validate({ query: listTermsSchema }), asyncHandler(termController.list));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(termController.get));

// Write — ADMIN only
router.use(authorize('ADMIN'));
router.post('/', validate({ body: createTermSchema }), asyncHandler(termController.create));
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateTermSchema }),
  asyncHandler(termController.update),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(termController.remove),
);

export default router;