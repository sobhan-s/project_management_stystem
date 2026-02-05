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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: johndoe_01
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "StrongPass123!"
 *               first_name:
 *                 type: string
 *                  example : "sobhan"
 *                 maxLength: 50
 *               last_name:
 *                 type: string
 *                 example : "sahoo"
 *                 maxLength: 50
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Registration successful. Please verify your email." }
 *                 data: { type: object }
 *       400:
 *         description: Validation error
 */
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
