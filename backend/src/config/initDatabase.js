import { getDatabase, closeDatabase } from './database.js';
import logger from '../utils/logger.js';

function initDatabase() {
  const db = getDatabase();

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Emotions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS emotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      emotions TEXT NOT NULL,
      dominant_emotion TEXT NOT NULL,
      blink_count INTEGER DEFAULT 0,
      stress_level REAL DEFAULT 0,
      wellness_score REAL DEFAULT 50,
      ai_insight TEXT,
      recommendations TEXT,
      session_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Journal entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      mood_rating INTEGER NOT NULL,
      ai_analysis TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_id TEXT UNIQUE NOT NULL,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME,
      duration INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  logger.info('Database initialized successfully');
  console.log('✅ Database tables created successfully');
  
  closeDatabase();
}

initDatabase();
