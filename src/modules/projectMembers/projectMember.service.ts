import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../config/logger.config.js';
import { projectRepository } from '../../repository/project.repository.js';
import { projectMemberRepository } from '../../repository/projectMember.repository.js';
import { userRepository } from '../../repository/user.repository.js';
import {
  mapProjectMember,
  type ProjectMemberResponse,
} from '../../mappers/index.js';
import { type Role } from '../../interfaces/index.js';
import {
  getMembership,
  assertPermission,
  assertCanManage,
  assertCanAssign,
} from '../../utils/Rbac.js';

export const addProjectMember = (
  projectId: number,
  givenUserId: number,
  takenUserId: number,
  role: string,
): ProjectMemberResponse => {
  logger.info('Adding project member', {
    projectId,
    givenUserId,
    takenUserId,
  });

  const project = projectRepository.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const actorMembership = getMembership(projectId, givenUserId);
  assertPermission(actorMembership.role as Role, 'MEMBER_ADD');
  assertCanAssign(actorMembership.role as Role, role as Role);

  const targetUser = userRepository.findById(takenUserId);
  if (!targetUser) {
    throw new ApiError(404, 'User not found');
  }

  const existingMembership = projectMemberRepository.findByProjectAndUser(
    projectId,
    takenUserId,
  );
  if (existingMembership) {
    throw new ApiError(409, 'User is already a member of this project');
  }

  const member = projectMemberRepository.create(projectId, takenUserId, role);

  logger.info('Project member added', {
    projectId,
    userId: takenUserId,
    role: role,
  });
  return mapProjectMember(member);
};

export const emailToIdService = (email: string): number => {
  logger.info('start fetching id to email');
  return userRepository.emailToId(email);
};

export const updateProjectMemberRole = (
  projectId: number,
  actorUserId: number,
  targetUserId: number,
  data: { role: string },
): ProjectMemberResponse => {
  logger.info('Updating project member role', {
    projectId,
    actorUserId,
    targetUserId,
  });

  const project = projectRepository.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const actorMembership = getMembership(projectId, actorUserId);
  assertPermission(actorMembership.role as Role, 'MEMBER_UPDATE');

  const targetMembership = projectMemberRepository.findByProjectAndUser(
    projectId,
    targetUserId,
  );
  if (!targetMembership) {
    throw new ApiError(404, 'Member not found in this project');
  }

  if (actorUserId === targetUserId) {
    throw new ApiError(400, 'You cannot change your own role');
  }

  assertCanManage(actorMembership.role as Role, targetMembership.role as Role);
  assertCanAssign(actorMembership.role as Role, data.role as Role);

  const updatedMember = projectMemberRepository.updateRole(
    projectId,
    targetUserId,
    data.role,
  );
  if (!updatedMember) {
    throw new ApiError(500, 'Failed to update member role');
  }

  logger.info('Project member role updated', {
    projectId,
    userId: targetUserId,
    newRole: data.role,
  });
  return mapProjectMember(updatedMember);
};

export const removeProjectMember = (
  projectId: number,
  actorUserId: number,
  targetUserId: number,
): void => {
  logger.info('Removing project member', {
    projectId,
    actorUserId,
    targetUserId,
  });

  const project = projectRepository.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const actorMembership = getMembership(projectId, actorUserId);

  const targetMembership = projectMemberRepository.findByProjectAndUser(
    projectId,
    targetUserId,
  );
  if (!targetMembership) {
    throw new ApiError(404, 'Member not found in this project');
  }

  if (actorUserId === targetUserId) {
    if (targetMembership.role === 'OWNER') {
      const ownerCount = projectMemberRepository.countOwners(projectId);
      if (ownerCount <= 1) {
        throw new ApiError(
          404,
          'Cannot remove the last owner. Transfer ownership first.',
        );
      }
    }
    projectMemberRepository.delete(projectId, targetUserId);
    logger.info('User left project', { projectId, userId: targetUserId });
    return;
  }

  assertPermission(actorMembership.role as Role, 'MEMBER_REMOVE');
  assertCanManage(actorMembership.role as Role, targetMembership.role as Role);

  if (targetMembership.role === 'OWNER') {
    const ownerCount = projectMemberRepository.countOwners(projectId);
    if (ownerCount <= 1) {
      throw new ApiError(400, 'Cannot remove the last owner');
    }
  }

  projectMemberRepository.delete(projectId, targetUserId);

  logger.info('Project member removed', { projectId, userId: targetUserId });
};
