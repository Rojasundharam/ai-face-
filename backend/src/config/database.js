import Database from 'better-sqlite3';
import { config } from './config.js';
import logger from '../utils/logger.js';

let db;

export function getDatabase() {
  if (!db) {
    try {
      db = new Database(config.database.path);
      db.pragma('journal_mode = WAL');
      logger.info('Database connected', { path: config.database.path });
    } catch (error) {
      logger.error('Database connection failed', { error: error.message });
      throw error;
    }
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    logger.info('Database closed');
  }
}
