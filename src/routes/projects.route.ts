import { Router } from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
} from '../validations/index.js';
import {
  createProjectHandler,
  getProjectByIdHandler,
  getProjectsHandler,
  updateProjectHandler,
  deleteProjectHandler,
} from '../modules/project/project.controller.js';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /projects/create:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: My First Project
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: This project is about building a SaaS app
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.post('/create', validate(createProjectSchema), createProjectHandler);

/**
 * @swagger
 * /projects/getProjects:
 *   get:
 *     summary: Get all projects for current user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects fetched successfully
 *       401:
 *         description: Unauthorized
 */

router.get('/getProjects', getProjectsHandler);

/**
 * @swagger
 * /projects/get-project-by-id/{projectId}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Project fetched successfully
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */

router.get('/get-project-by-id/:projectId', getProjectByIdHandler);

/**
 * @swagger
 * /projects/updateProject/{projectId}:
 *   put:
 *     summary: Update project details
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Updated Project Name
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Updated project description
 *               is_archived:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       204:
 *         description: Project updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */

router.put(
  '/updateProject/:projectId',
  validate(updateProjectSchema),
  updateProjectHandler,
);

/**
 * @swagger
 * /projects/delete/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       204:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */

router.delete('/delete/:projectId', deleteProjectHandler);

export default router;
