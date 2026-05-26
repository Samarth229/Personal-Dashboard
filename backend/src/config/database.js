const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const DB_PATH = path.join(__dirname, '../../data/dashboard.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

logger.info(`SQLite database at ${DB_PATH}`);

// Promisify-compatible API that matches the pg interface used across the codebase
const query = (text, params = []) => {
  try {
    // Translate $1,$2,... placeholders to ?,?,... for SQLite
    let sql = text.replace(/\$(\d+)/g, '?');

    // Detect statement type
    const trimmed = sql.trim().toUpperCase();

    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
      const rows = db.prepare(sql).all(...params);
      return Promise.resolve({ rows });
    }

    if (trimmed.startsWith('INSERT') && sql.toUpperCase().includes('RETURNING')) {
      // SQLite doesn't support RETURNING — run insert then fetch last row
      const withoutReturning = sql.replace(/RETURNING\s+[\s\S]+$/i, '').trim();
      const stmt = db.prepare(withoutReturning);
      const info = stmt.run(...params);
      // Try to fetch the inserted row by rowid
      const table = (sql.match(/INTO\s+(\w+)/i) || [])[1];
      if (table && info.lastInsertRowid) {
        const row = db.prepare(`SELECT * FROM ${table} WHERE rowid=?`).get(info.lastInsertRowid);
        return Promise.resolve({ rows: row ? [row] : [] });
      }
      return Promise.resolve({ rows: [] });
    }

    const info = db.prepare(sql).run(...params);
    return Promise.resolve({ rows: [], rowCount: info.changes });
  } catch (err) {
    return Promise.reject(err);
  }
};

const getClient = () => ({ query, release: () => {} });

module.exports = { query, getClient, db };
