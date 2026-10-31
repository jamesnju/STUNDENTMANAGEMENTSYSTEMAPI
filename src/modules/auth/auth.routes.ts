import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { loginSchema } from './auth.schema';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();
router.post('/login', validate({ body: loginSchema }), asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.me));
export default router;