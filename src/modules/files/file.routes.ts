import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { upload } from '../../middlewares/upload';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { fileController } from './file.controller';
import {
  idParamSchema,
  listFilesSchema,
  signUploadQuerySchema,
  uploadMultipartSchema,
} from './file.schema';

const router = Router();
router.use(authenticate);

// Signed direct upload params — preferred path on Vercel free (no body limit)
router.get(
  '/sign',
  validate({ query: signUploadQuerySchema }),
  asyncHandler(fileController.sign),
);

// Server-mediated upload (small files only; 15 MB cap)
router.post(
  '/upload',
  upload(15).single('file'),
  validate({ body: uploadMultipartSchema }),
  asyncHandler(fileController.upload),
);

router.get(
  '/',
  validate({ query: listFilesSchema }),
  asyncHandler(fileController.list),
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(fileController.get),
);

router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(fileController.remove),
);

export default router;