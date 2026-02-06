import { Router } from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  updateUserSchema,
  changePasswordSchema,
} from '../validations/index.js';
import {
  getMe,
  updateMe,
  deleteMe,
  changePasswordHandler,
  getUserByIdHandler,
} from '../modules/user/user.controller.js';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details fetched successfully
 *       401:
 *         description: Unauthorized
 */

router.get('/me', getMe);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 maxLength: 50
 *                 example: Sobhan
 *               last_name:
 *                 type: string
 *                 maxLength: 50
 *                 example: Sahoo
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: sobhan_01
 *     responses:
 *       204:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.put('/me', validate(updateUserSchema), updateMe);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete current user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */

router.delete('/me', deleteMe);

/**
 * @swagger
 * /users/me/password:
 *   patch:
 *     summary: Change current user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPassword123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewPassword123!
 *     responses:
 *       204:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.patch(
  '/me/password',
  validate(changePasswordSchema),
  changePasswordHandler,
);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 */

router.get('/:userId', getUserByIdHandler);

export default router;
