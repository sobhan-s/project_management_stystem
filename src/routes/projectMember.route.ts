import { Router } from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  addMemberSchema,
  updateMemberRoleSchema,
} from '../validations/index.js';
import {
  addMemberHandler,
  getMembersHandler,
  updateMemberHandler,
  removeMemberHandler,
} from '../modules/projectMembers/projectMembers.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/:projectId/members/add', validate(addMemberSchema), addMemberHandler);
router.get('/:projectId/members', getMembersHandler);
router.patch('/:projectId/members/updateRole', validate(updateMemberRoleSchema), updateMemberHandler);
router.delete('/:projectId/members/:userId', removeMemberHandler);

export default router;
