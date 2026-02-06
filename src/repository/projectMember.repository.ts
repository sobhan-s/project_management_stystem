import { logger } from '../config/logger.config.js';
import { getDB as db } from '../database/Db.js';
import type {
  ProjectMember,
  ProjectMemberWithRole,
} from '../interfaces/index.js';

export const projectMemberRepository = {
  create: (
    projectId: number,
    userId: number,
    roleId: number,
  ): ProjectMemberWithRole => {
    const result = db()
      .prepare(
        'INSERT INTO project_members (project_id, user_id, role_id) VALUES (?, ?, ?)',
      )
      .run(projectId, userId, roleId);

    return db()
      .prepare('SELECT * FROM project_members WHERE id = ?')
      .get(result.lastInsertRowid) as ProjectMemberWithRole;
  },

  findByProjectAndUser: (
    projectId: number,
    userId: number,
  ): ProjectMemberWithRole | undefined => {
    logger.info(projectId);
    logger.info(userId);
    const ussss = db()
      .prepare(
        `SELECT pm.*, r.name as role_name, r.level as role_level
         FROM project_members pm
         INNER JOIN roles r ON r.id = pm.role_id
         WHERE pm.project_id = ? AND pm.user_id = ?`,
      )
      .get(projectId, userId) as ProjectMemberWithRole | undefined;
    logger.info(ussss);
    return ussss;
  },

  findByProject: (projectId: number): ProjectMemberWithRole[] => {
    return db()
      .prepare(
        `SELECT pm.*, r.name as role_name, r.level as role_level
         FROM project_members pm
         INNER JOIN roles r ON r.id = pm.role_id
         WHERE pm.project_id = ?
         ORDER BY pm.joined_at ASC`,
      )
      .all(projectId) as ProjectMemberWithRole[];
  },

  updateRole: (
    projectId: number,
    userId: number,
    roleId: number,
  ): ProjectMemberWithRole | undefined => {
    db()
      .prepare(
        'UPDATE project_members SET role_id = ? WHERE project_id = ? AND user_id = ?',
      )
      .run(roleId, projectId, userId);

    return db()
      .prepare(
        `SELECT pm.*, r.name as role_name, r.level as role_level
         FROM project_members pm
         INNER JOIN roles r ON r.id = pm.role_id
         WHERE pm.project_id = ? AND pm.user_id = ?`,
      )
      .get(projectId, userId) as ProjectMemberWithRole | undefined;
  },

  delete: (projectId: number, userId: number): void => {
    db()
      .prepare(
        'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      )
      .run(projectId, userId);
  },

  countByRole: (projectId: number, roleName: string): number => {
    const row = db()
      .prepare(
        `SELECT COUNT(*) as count FROM project_members pm
         INNER JOIN roles r ON r.id = pm.role_id
         WHERE pm.project_id = ? AND r.name = ?`,
      )
      .get(projectId, roleName) as { count: number };
    return row.count;
  },
};
