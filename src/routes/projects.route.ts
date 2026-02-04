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

router.post('/create', validate(createProjectSchema), createProjectHandler);
router.get('/getProjects', getProjectsHandler);
router.get('/get-project-by-id/:projectId', getProjectByIdHandler);
router.put(
  '/updateProject/:projectId',
  validate(updateProjectSchema),
  updateProjectHandler,
);
router.delete('/delete/:projectId', deleteProjectHandler);

export default router;
