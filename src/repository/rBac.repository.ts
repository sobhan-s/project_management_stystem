import { logger } from '../config/logger.config.js';
import { getDB as db } from '../database/Db.js';
import type { Role, Permission, RolePermission } from '../interfaces/index.js';

export const roleRepository = {
  findAll: (): Role[] => {
    return db()
      .prepare('SELECT * FROM roles ORDER BY level DESC')
      .all() as Role[];
  },

  findById: (id: number): Role | undefined => {
    return db().prepare('SELECT * FROM roles WHERE id = ?').get(id) as
      | Role
      | undefined;
  },

  findByName: (name: string): Role | undefined => {
    return db().prepare('SELECT * FROM roles WHERE name = ?').get(name) as
      | Role
      | undefined;
  },
};

export const permissionRepository = {
  findAll: (): Permission[] => {
    return db()
      .prepare('SELECT * FROM permissions ORDER BY resource, action')
      .all() as Permission[];
  },

  findById: (id: number): Permission | undefined => {
    return db().prepare('SELECT * FROM permissions WHERE id = ?').get(id) as
      | Permission
      | undefined;
  },

  findByName: (name: string): Permission | undefined => {
    return db()
      .prepare('SELECT * FROM permissions WHERE name = ?')
      .get(name) as Permission | undefined;
  },

  findByRoleId: (roleId: number): Permission[] => {
    return db()
      .prepare(
        `SELECT p.* FROM permissions p
         INNER JOIN role_permissions rp ON rp.permission_id = p.id
         WHERE rp.role_id = ?
         ORDER BY p.resource, p.action`,
      )
      .all(roleId) as Permission[];
  },
};

export const rolePermissionRepository = {
  hasPermission: (roleId: number, permissionName: string): boolean => {
    logger.info(roleId);
    logger.info(permissionName);
    const row = db()
      .prepare(
        `SELECT COUNT(*) as count FROM role_permissions rp
         INNER JOIN permissions p ON p.id = rp.permission_id
         WHERE rp.role_id = ? AND p.name = ?`,
      )
      .get(roleId, permissionName) as { count: number };

    logger.info(row.count);
    return row.count > 0;
  },

  getPermissionNames: (roleId: number): string[] => {
    const rows = db()
      .prepare(
        `SELECT p.name FROM permissions p
         INNER JOIN role_permissions rp ON rp.permission_id = p.id
         WHERE rp.role_id = ?`,
      )
      .all(roleId) as Array<{ name: string }>;
    return rows.map((r) => r.name);
  },
};
