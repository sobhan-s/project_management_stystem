import { getDB as db } from '../database/Db.js';
import type { Project } from '../interfaces/index.js';

export const projectRepository = {
  create: (data: {
    name: string;
    description: string;
    created_by: number;
  }): Project => {
    const result = db()
      .prepare(
        'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
      )
      .run(data.name, data.description ?? null, data.created_by);

    return db()
      .prepare('SELECT * FROM projects WHERE id = ?')
      .get(result.lastInsertRowid) as Project;
  },

  findById: (id: number): Project | undefined => {
    return db().prepare('SELECT * FROM projects WHERE id = ?').get(id) as
      | Project
      | undefined;
  },

  findByUserId: (userId: number): Project[] => {
    return db()
      .prepare(
        `SELECT DISTINCT p.* FROM projects p
         INNER JOIN project_members pm ON pm.project_id = p.id
         WHERE pm.user_id = ?
         ORDER BY p.created_at DESC`,
      )
      .all(userId) as Project[];
  },

  update: (
    id: number,
    data: { name?: string; description?: string; is_archived?: boolean },
  ): Project | undefined => {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.is_archived !== undefined) {
      fields.push('is_archived = ?');
      values.push(data.is_archived ? 1 : 0);
    }

    if (fields.length === 0)
      return db().prepare('SELECT * FROM projects WHERE id = ?').get(id) as
        | Project
        | undefined;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db()
      .prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`)
      .run(...values);

    return db().prepare('SELECT * FROM projects WHERE id = ?').get(id) as
      | Project
      | undefined;
  },

  delete: (id: number): void => {
    db().prepare('DELETE FROM projects WHERE id = ?').run(id);
  },
};
