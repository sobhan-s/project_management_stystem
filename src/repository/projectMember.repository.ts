import { getDB as db } from '../database/Db.js';
import type { ProjectMember } from '../interfaces/index.js';

export const projectMemberRepository = {
  create: (projectId: number, userId: number, role: string): ProjectMember => {
    const result = db()
      .prepare(
        'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      )
      .run(projectId, userId, role);

    return db()
      .prepare('SELECT * FROM project_members WHERE id = ?')
      .get(result.lastInsertRowid) as ProjectMember;
  },

  findByProjectAndUser: (
    projectId: number,
    userId: number,
  ): ProjectMember | undefined => {
    return db()
      .prepare(
        'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
      )
      .get(projectId, userId) as ProjectMember | undefined;
  },

  findByProject: (projectId: number): ProjectMember[] => {
    return db()
      .prepare(
        'SELECT * FROM project_members WHERE project_id = ? ORDER BY joined_at ASC',
      )
      .all(projectId) as ProjectMember[];
  },

  updateRole: (
    projectId: number,
    userId: number,
    role: string,
  ): ProjectMember | undefined => {
    db()
      .prepare(
        'UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?',
      )
      .run(role, projectId, userId);

    return db()
      .prepare(
        'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
      )
      .get(projectId, userId) as ProjectMember | undefined;
  },

  delete: (projectId: number, userId: number): void => {
    db()
      .prepare(
        'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      )
      .run(projectId, userId);
  },

  countOwners: (projectId: number): number => {
    const row = db()
      .prepare(
        "SELECT COUNT(*) as count FROM project_members WHERE project_id = ? AND role = 'OWNER'",
      )
      .get(projectId) as { count: number };
    return row.count;
  },
};
