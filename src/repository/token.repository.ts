import { getDB as db } from '../database/Db.js';
import type {
  EmailVerificationToken,
  PasswordResetToken,
  RefreshToken,
} from '../interfaces/index.js';

export const emailVerificationTokenRepository = {
  create: (
    userId: number,
    token: string,
    expiresAt: string,
  ): EmailVerificationToken => {
    const result = db()
      .prepare(
        'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      )
      .run(userId, token, expiresAt);

    return db()
      .prepare('SELECT * FROM email_verification_tokens WHERE id = ?')
      .get(result.lastInsertRowid) as EmailVerificationToken;
  },

  findByToken: (token: string): EmailVerificationToken | undefined => {
    return db()
      .prepare('SELECT * FROM email_verification_tokens WHERE token = ?')
      .get(token) as EmailVerificationToken | undefined;
  },

  markUsed: (id: number): void => {
    db()
      .prepare('UPDATE email_verification_tokens SET is_used = 1 WHERE id = ?')
      .run(id);
  },

  deleteByUserId: (userId: number): void => {
    db()
      .prepare('DELETE FROM email_verification_tokens WHERE user_id = ?')
      .run(userId);
  },
};

export const passwordResetTokenRepository = {
  create: (
    userId: number,
    token: string,
    expiresAt: string,
  ): PasswordResetToken => {
    const result = db()
      .prepare(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      )
      .run(userId, token, expiresAt);

    return db()
      .prepare('SELECT * FROM password_reset_tokens WHERE id = ?')
      .get(result.lastInsertRowid) as PasswordResetToken;
  },

  findByToken: (token: string): PasswordResetToken | undefined => {
    return db()
      .prepare('SELECT * FROM password_reset_tokens WHERE token = ?')
      .get(token) as PasswordResetToken | undefined;
  },

  markUsed: (id: number): void => {
    db()
      .prepare('UPDATE password_reset_tokens SET is_used = 1 WHERE id = ?')
      .run(id);
  },

  deleteByUserId: (userId: number): void => {
    db()
      .prepare('DELETE FROM password_reset_tokens WHERE user_id = ?')
      .run(userId);
  },
};

export const refreshTokenRepository = {
  create: (userId: number, token: string, expiresAt: string): RefreshToken => {
    const result = db()
      .prepare(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      )
      .run(userId, token, expiresAt);

    return db()
      .prepare('SELECT * FROM refresh_tokens WHERE id = ?')
      .get(result.lastInsertRowid) as RefreshToken;
  },

  findByToken: (token: string): RefreshToken | undefined => {
    return db()
      .prepare('SELECT * FROM refresh_tokens WHERE token = ?')
      .get(token) as RefreshToken | undefined;
  },

  deleteByToken: (token: string): void => {
    db().prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
  },

  deleteByUserId: (userId: number): void => {
    db().prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
  },
};
