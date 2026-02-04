import { type Role } from '../interfaces/index.js';
import { ApiError } from '../utils/ApiError.js';
import { projectMemberRepository } from '../repository/projectMember.repository.js';
export const ROLE_HIERARCHY: Record<Role, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

export const PERMISSIONS = {
  PROJECT_UPDATE: ['OWNER', 'ADMIN'] as Role[],
  PROJECT_DELETE: ['OWNER'] as Role[],
  MEMBER_ADD: ['OWNER', 'ADMIN'] as Role[],
  MEMBER_UPDATE: ['OWNER', 'ADMIN'] as Role[],
  MEMBER_REMOVE: ['OWNER', 'ADMIN'] as Role[],
  MEMBER_LIST: ['OWNER', 'ADMIN', 'MEMBER'] as Role[],
  PROJECT_VIEW: ['OWNER', 'ADMIN', 'MEMBER'] as Role[],
};

export type PermissionKey = keyof typeof PERMISSIONS;
export const hasRole = (actorRole: Role, allowedRoles: Role[]): boolean => {
  return allowedRoles.includes(actorRole);
};

export const canManageRole = (actorRole: Role, targetRole: Role): boolean => {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
};

export const assertPermission = (
  actorRole: Role,
  permission: PermissionKey,
): void => {
  if (!hasRole(actorRole, PERMISSIONS[permission])) {
    throw new ApiError(
      403,
      `Insufficient role. Required: ${PERMISSIONS[permission].join(' or ')}`,
    );
  }
};

export const assertCanManage = (actorRole: Role, targetRole: Role): void => {
  if (!canManageRole(actorRole, targetRole)) {
    throw new ApiError(
      403,
      'You cannot manage a member with a role equal to or higher than yours',
    );
  }
};

export const assertCanAssign = (actorRole: Role, assigningRole: Role): void => {
  if (!canManageRole(actorRole, assigningRole)) {
    throw new ApiError(
      403,
      'You cannot assign a role equal to or higher than your own',
    );
  }
};

export const getMembership = (projectId: number, userId: number) => {
  const membership = projectMemberRepository.findByProjectAndUser(
    projectId,
    userId,
  );

  if (!membership) {
    throw new ApiError(403, 'Access denied');
  }

  return membership;
};
