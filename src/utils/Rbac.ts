import { type ProjectMemberWithRole, type Role } from '../interfaces/index.js';
import { ApiError } from '../utils/ApiError.js';
import { projectMemberRepository } from '../repository/projectMember.repository.js';
import {
  rolePermissionRepository,
  roleRepository,
} from '../repository/rBac.repository.js';
import { logger } from '../config/logger.config.js';

export const getMembership = (
  projectId: number,
  userId: number,
): ProjectMemberWithRole => {
  const membership = projectMemberRepository.findByProjectAndUser(
    projectId,
    userId,
  );
  if (!membership) {
    throw new ApiError(403, 'Access denied');
  }
  return membership;
};

export const assertPermission = (
  roleId: number,
  permissionName: string,
): void => {
  const hasPermission = rolePermissionRepository.hasPermission(
    roleId,
    permissionName,
  );
  if (!hasPermission) {
    throw new ApiError(
      403,
      `Insufficient permissions. Required: ${permissionName}`,
    );
  }
};

export const canManageRole = (
  actorRoleLevel: number,
  targetRoleLevel: number,
): boolean => {
  logger.info({ actorRoleLevel, targetRoleLevel });
  // INVERTED: Lower number = higher privilege, so use < instead of >
  return actorRoleLevel < targetRoleLevel;
};

export const assertCanManage = (
  actorRoleLevel: number,
  targetRoleLevel: number,
): void => {
  if (!canManageRole(actorRoleLevel, targetRoleLevel)) {
    throw new ApiError(
      403,
      'You cannot manage a member with a role equal to or higher than yours',
    );
  }
};

export const assertCanAssign = (
  actorRoleLevel: number,
  assigningRoleLevel: number,
): void => {
  if (actorRoleLevel > assigningRoleLevel) {
    throw new ApiError(403, 'You cannot assign a role higher than your own');
  }
};

export const getRoleByName = (roleName: string) => {
  const role = roleRepository.findByName(roleName);
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }
  return role;
};
