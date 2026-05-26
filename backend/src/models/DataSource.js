const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const DataSource = {
  findByUser(userId) {
    const rows = db.prepare('SELECT * FROM data_sources WHERE user_id=? ORDER BY source_name').all(userId);
    return Promise.resolve(rows.map(deserialize));
  },

  findOne(userId, sourceName) {
    const row = db.prepare('SELECT * FROM data_sources WHERE user_id=? AND source_name=?').get(userId, sourceName);
    return Promise.resolve(row ? deserialize(row) : null);
  },

  upsert(userId, sourceName, data) {
    const toInt = (v) => (v === false || v === 0 || v == null ? 0 : 1);
    const toTs = (v) => v instanceof Date ? v.toISOString() : (v || null);

    const existing = db.prepare('SELECT id FROM data_sources WHERE user_id=? AND source_name=?').get(userId, sourceName);
    if (existing) {
      db.prepare(`UPDATE data_sources SET is_enabled=?,access_token=?,refresh_token=?,token_expires_at=?,updated_at=datetime('now') WHERE user_id=? AND source_name=?`)
        .run(toInt(data.is_enabled ?? 1), data.access_token || null, data.refresh_token || null, toTs(data.token_expires_at), userId, sourceName);
    } else {
      db.prepare('INSERT INTO data_sources (id,user_id,source_name,is_enabled,access_token,refresh_token,token_expires_at) VALUES (?,?,?,?,?,?,?)')
        .run(uuidv4(), userId, sourceName, toInt(data.is_enabled ?? 1), data.access_token || null, data.refresh_token || null, toTs(data.token_expires_at));
    }
    const row = db.prepare('SELECT * FROM data_sources WHERE user_id=? AND source_name=?').get(userId, sourceName);
    return Promise.resolve(deserialize(row));
  },

  updateStatus(userId, sourceName, status, errorMessage = null) {
    db.prepare(`UPDATE data_sources SET sync_status=?,last_sync=datetime('now'),error_message=?,updated_at=datetime('now') WHERE user_id=? AND source_name=?`)
      .run(status, errorMessage, userId, sourceName);
    return Promise.resolve();
  },

  setEnabled(userId, sourceName, isEnabled) {
    db.prepare("UPDATE data_sources SET is_enabled=?,updated_at=datetime('now') WHERE user_id=? AND source_name=?")
      .run(isEnabled ? 1 : 0, userId, sourceName);
    return Promise.resolve();
  },

  initDefaults(userId) {
    const sources = ['spotify', 'github', 'gmail', 'fitness', 'letterboxd', 'steam', 'riot'];
    const insert = db.prepare('INSERT OR IGNORE INTO data_sources (id,user_id,source_name,is_enabled) VALUES (?,?,?,0)');
    for (const s of sources) insert.run(uuidv4(), userId, s);
    return Promise.resolve();
  },
};

const deserialize = (row) => row ? { ...row, is_enabled: !!row.is_enabled } : null;

module.exports = DataSource;
