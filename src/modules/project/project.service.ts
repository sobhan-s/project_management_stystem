import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../config/logger.config.js';
import { projectRepository } from '../../repository/project.repository.js';
import { projectMemberRepository } from '../../repository/projectMember.repository.js';
import {
  mapProject,
  mapProjectMembers,
  type ProjectResponse,
} from '../../mappers/index.js';
import type { Role } from '../../interfaces/index.js';
import { assertPermission, getMembership } from '../../utils/Rbac.js';

export const createProject = (
  userId: number,
  data: { name: string; description: string },
): ProjectResponse => {
  logger.info('Creating project', { userId, name: data.name });

  const project = projectRepository.create({
    name: data.name,
    description: data.description,
    created_by: userId,
  });

  projectMemberRepository.create(project.id, userId, 'OWNER');
  logger.info('Project created successfully', { projectId: project.id });
  return mapProject(project);
};

export const getProjects = (userId: number): ProjectResponse[] => {
  logger.info('Fetching projects for user', { userId });
  const projects = projectRepository.findByUserId(userId);
  return projects.map(mapProject);
};

export const getProjectById = (
  projectId: number,
  userId: number,
): ProjectResponse => {
  logger.info('Fetching project by ID', { projectId, userId });

  const project = projectRepository.findById(projectId);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }
  const membership = getMembership(projectId, userId);

  assertPermission(membership.role as Role, 'PROJECT_VIEW');

  return mapProject(project);
};

export const updateProject = (
  projectId: number,

  userId: number,

  data: { name?: string; description?: string; is_archived?: boolean },
): ProjectResponse => {
  logger.info('Updating project', { projectId, userId });

  const project = projectRepository.findById(projectId);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const membership = getMembership(projectId, userId);

  assertPermission(membership.role as Role, 'PROJECT_UPDATE');

  const updatedProject = projectRepository.update(projectId, data);

  if (!updatedProject) {
    throw new ApiError(500, 'Failed to update project');
  }

  logger.info('Project updated successfully', { projectId });

  return mapProject(updatedProject);
};

export const deleteProject = (projectId: number, userId: number): void => {
  logger.info('Deleting project', { projectId, userId });

  const project = projectRepository.findById(projectId);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const membership = getMembership(projectId, userId);

  assertPermission(membership.role as Role, 'PROJECT_DELETE');

  projectRepository.delete(projectId);

  logger.info('Project deleted successfully', { projectId });
};

export const getProjectMembers = (projectId: number, userId: number) => {
  logger.info('Fetching project members', { projectId, userId });

  const project = projectRepository.findById(projectId);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const membership = getMembership(projectId, userId);

  assertPermission(membership.role as Role, 'MEMBER_LIST');

  const members = projectMemberRepository.findByProject(projectId);

  return mapProjectMembers(members);
};
