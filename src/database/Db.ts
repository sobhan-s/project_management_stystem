import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config/envConfig.js';
import { logger } from '../config/logger.config.js';

let dbInstance: Database.Database | null = null;

export function getDB(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const DB_DIR = path.dirname(path.resolve(config.dbPath));

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(path.resolve(config.dbPath));

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  dbInstance = db;

  logger.info('SQLite DB connected');

  return dbInstance;
}
