import { Router } from 'express';
import { settingsController } from './settings.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import {
  createSettingSchema,
  updateSettingSchema,
  paramParamSchema,
  listSettingsSchema,
} from './settings.schema';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get(
  '/',
  validate({ query: listSettingsSchema }),
  asyncHandler(settingsController.list),
);

router.post(
  '/',
  validate({ body: createSettingSchema }),
  asyncHandler(settingsController.create),
);

router.get(
  '/:param',
  validate({ params: paramParamSchema }),
  asyncHandler(settingsController.get),
);

router.patch(
  '/:param',
  validate({ params: paramParamSchema, body: updateSettingSchema }),
  asyncHandler(settingsController.update),
);

router.delete(
  '/:param',
  validate({ params: paramParamSchema }),
  asyncHandler(settingsController.remove),
);

export default router;