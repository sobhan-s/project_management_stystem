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

/**
 * @swagger
 * /prMembers/{projectId}/members/add:
 *   post:
 *     summary: Add a member to a project
 *     tags: [Project Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userEmail, role]
 *             properties:
 *               userEmail:
 *                 type: string
 *                 format: email
 *                 example: member@example.com
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER]
 *                 example: MEMBER
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only project admins can add members)
 */

router.post(
  '/:projectId/members/add',
  validate(addMemberSchema),
  addMemberHandler,
);

/**
 * @swagger
 * /prMembers/{projectId}/members:
 *   get:
 *     summary: Get all members of a project
 *     tags: [Project Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Project members fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project not found
 */

router.get('/:projectId/members', getMembersHandler);

/**
 * @swagger
 * /prMembers/{projectId}/members/updateRole:
 *   patch:
 *     summary: Update project member role
 *     tags: [Project Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         example: member@example.com
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER]
 *                 example: ADMIN
 *     responses:
 *       204:
 *         description: Member role updated successfully
 *       400:
 *         description: Validation error or missing email
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only admins can update roles)
 */

router.patch(
  '/:projectId/members/updateRole',
  validate(updateMemberRoleSchema),
  updateMemberHandler,
);

/**
 * @swagger
 * /prMembers/{projectId}/members/removeRole:
 *   delete:
 *     summary: Remove a member from project
 *     tags: [Project Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         example: member@example.com
 *     responses:
 *       204:
 *         description: Member removed successfully
 *       400:
 *         description: Missing email parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only admins can remove members)
 */

router.delete('/:projectId/members/removeRole', removeMemberHandler);

export default router;
