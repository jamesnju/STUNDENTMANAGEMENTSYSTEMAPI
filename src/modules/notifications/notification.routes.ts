import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { notificationController } from './notification.controller';
import {
  createNotificationSchema,
  idParamSchema,
  listNotificationsSchema,
  markReadSchema,
} from './notification.schema';
import { paginationSchema } from '../../shared/utils/pagination';

const router = Router();
router.use(authenticate);

// ── Inbox (any authenticated user) ──────────────────────
router.get(
  '/inbox',
  validate({ query: paginationSchema }),
  asyncHandler(notificationController.inbox),
);
router.post(
  '/inbox/read',
  validate({ body: markReadSchema }),
  asyncHandler(notificationController.markRead),
);

// ── Create + manage (ADMIN or TEACHER-with-class) ───────
router.post(
  '/',
  authorize('ADMIN', 'TEACHER'),
  validate({ body: createNotificationSchema }),
  asyncHandler(notificationController.create),
);

router.get(
  '/',
  authorize('ADMIN'),
  validate({ query: listNotificationsSchema }),
  asyncHandler(notificationController.list),
);

router.get(
  '/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  asyncHandler(notificationController.get),
);

router.post(
  '/:id/cancel',
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  asyncHandler(notificationController.cancel),
);

export default router;