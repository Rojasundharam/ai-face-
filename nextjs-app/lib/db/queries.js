import { getDatabase } from '../config/database.js';

export const UserModel = {
  create(username, email, passwordHash) {
    const db = getDatabase();
    const stmt = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    );
    return stmt.run(username, email, passwordHash);
  },

  findByEmail(email) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  updatePreferences(userId, preferences) {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE users SET preferences = ? WHERE id = ?');
    return stmt.run(JSON.stringify(preferences), userId);
  }
};

export const EmotionModel = {
  create(data) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO emotion_readings (
        user_id, emotions, dominant_emotion, blink_count,
        stress_level, wellness_score, ai_insight, recommendations, session_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.userId,
      JSON.stringify(data.emotions),
      data.dominantEmotion,
      data.blinkCount || 0,
      data.stressLevel || 0,
      data.wellnessScore || 50,
      data.aiInsight || null,
      data.recommendations ? JSON.stringify(data.recommendations) : null,
      data.sessionId || null
    );
  },

  getByUserId(userId, limit = 100) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM emotion_readings
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(userId, limit);
  },

  getByTimeframe(userId, startDate, endDate) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM emotion_readings
      WHERE user_id = ? AND timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `).all(userId, startDate, endDate);
  },

  getBySessionId(sessionId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM emotion_readings
      WHERE session_id = ?
      ORDER BY timestamp ASC
    `).all(sessionId);
  }
};

export const JournalModel = {
  create(data) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO mood_journal (
        user_id, date, mood_rating, journal_text, ai_analysis, tags, photo_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.userId,
      data.date,
      data.moodRating,
      data.journalText || null,
      data.aiAnalysis || null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.photoPath || null
    );
  },

  getByUserId(userId, limit = 30) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM mood_journal
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT ?
    `).all(userId, limit);
  },

  getByDate(userId, date) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM mood_journal
      WHERE user_id = ? AND date = ?
    `).get(userId, date);
  },

  update(id, data) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE mood_journal
      SET mood_rating = ?, journal_text = ?, ai_analysis = ?, tags = ?
      WHERE id = ?
    `);
    return stmt.run(
      data.moodRating,
      data.journalText,
      data.aiAnalysis,
      data.tags ? JSON.stringify(data.tags) : null,
      id
    );
  }
};
