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

router.get('/me', getMe);
router.put('/me', validate(updateUserSchema), updateMe);
router.delete('/me', deleteMe);
router.patch(
  '/me/password',
  validate(changePasswordSchema),
  changePasswordHandler,
);
router.get('/:userId', getUserByIdHandler);

export default router;
