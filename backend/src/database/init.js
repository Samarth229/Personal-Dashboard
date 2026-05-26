const { db } = require('../config/database');
const logger = require('../utils/logger');

const initDB = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      first_name TEXT,
      last_name TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS otp_tokens (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      is_used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS data_sources (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source_name TEXT NOT NULL,
      is_enabled INTEGER DEFAULT 1,
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at TEXT,
      last_sync TEXT,
      sync_status TEXT DEFAULT 'pending',
      error_message TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, source_name)
    );

    CREATE TABLE IF NOT EXISTS data_points (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source_name TEXT NOT NULL,
      data_type TEXT NOT NULL,
      value TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS insights (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      insight_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      data TEXT,
      severity TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      value TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, key)
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_otp_tokens_email ON otp_tokens(email);
    CREATE INDEX IF NOT EXISTS idx_data_sources_user_id ON data_sources(user_id);
    CREATE INDEX IF NOT EXISTS idx_data_points ON data_points(user_id, timestamp);
    CREATE INDEX IF NOT EXISTS idx_insights ON insights(user_id, created_at);
  `);
  logger.info('Database schema initialized');
};

module.exports = initDB;
