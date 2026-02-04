import { getDB as db } from '../database/Db.js';
import { type User } from '../interfaces/index.js';

export const userRepository = {
  findById: (id: number): User | undefined => {
    return db().prepare('SELECT * FROM users WHERE id = ?').get(id) as
      | User
      | undefined;
  },

  findByEmail: (email: string): User | undefined => {
    return db().prepare('SELECT * FROM users WHERE email = ?').get(email) as
      | User
      | undefined;
  },

  findByUsername: (username: string): User | undefined => {
    return db()
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username) as User | undefined;
  },

  create: (data: {
    email: string;
    username: string;
    password_hash: string;
    first_name?: string;
    last_name?: string;
  }): User => {
    const result = db()
      .prepare(
        `INSERT INTO users (email, username, password_hash, first_name, last_name)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        data.email,
        data.username,
        data.password_hash,
        data.first_name ?? null,
        data.last_name ?? null,
      );

    return db()
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(result.lastInsertRowid) as User;
  },

  emailToId: (email: string): number => {
    const result = db()
      .prepare(`SELECT id FROM users where email = ?`)
      .get(email);

    type res  = {
      id : number
    }
    const id = (result as res).id as number

    console.log("===========",id);
    return id;
  },

  update: (
    id: number,
    data: { first_name?: string; last_name?: string; username?: string },
  ): User | undefined => {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.first_name !== undefined) {
      fields.push('first_name = ?');
      values.push(data.first_name);
    }
    if (data.last_name !== undefined) {
      fields.push('last_name = ?');
      values.push(data.last_name);
    }
    if (data.username !== undefined) {
      fields.push('username = ?');
      values.push(data.username);
    }

    if (fields.length === 0)
      return db().prepare('SELECT * FROM users WHERE id = ?').get(id) as
        | User
        | undefined;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db()
      .prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
      .run(...values);

    return db().prepare('SELECT * FROM users WHERE id = ?').get(id) as
      | User
      | undefined;
  },

  updatePassword: (id: number, passwordHash: string): void => {
    db()
      .prepare(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      )
      .run(passwordHash, id);
  },

  markEmailVerified: (id: number): void => {
    db()
      .prepare(
        'UPDATE users SET is_email_verified = 1, email_verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      )
      .run(id);
  },

  markEmailVerifiedByEmailManual: (email: string): void => {
    db()
      .prepare(
        'UPDATE users SET is_email_verified = 1, email_verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
      )
      .run(email);
  },

  deactivate: (id: number): void => {
    db()
      .prepare(
        'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      )
      .run(id);
  },

  delete: (id: number): void => {
    db().prepare('DELETE FROM users WHERE id = ?').run(id);
  },
};
