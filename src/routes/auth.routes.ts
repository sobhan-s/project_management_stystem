import { Router } from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  refreshTokenSchema,
  resetPasswordSchemaPassword,
} from '../validations/index.js';
import {
  register,
  login,
  logout,
  refresh,
  verifyEmailHandler,
  resendVerificationHandler,
  forgotPassword,
  resetPasswordHandler,
  verifyEmailManualHandler,
} from '../modules/auth/auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/verify-email', verifyEmailHandler);
router.post('/manual-verify-email', verifyEmailManualHandler);
router.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  resendVerificationHandler,
);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authMiddleware, logout);
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post(
  '/reset-password',
  validate(resetPasswordSchemaPassword),
  resetPasswordHandler,
);

export default router;
