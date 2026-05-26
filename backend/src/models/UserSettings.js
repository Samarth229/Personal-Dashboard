const { db } = require('../config/database');

const UserSettings = {
  get(userId, key) {
    const row = db.prepare('SELECT value FROM user_settings WHERE user_id=? AND key=?').get(userId, key);
    return row?.value || null;
  },

  set(userId, key, value) {
    db.prepare(`
      INSERT INTO user_settings (user_id, key, value, updated_at) VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
    `).run(userId, key, value);
  },

  delete(userId, key) {
    db.prepare('DELETE FROM user_settings WHERE user_id=? AND key=?').run(userId, key);
  },
};

module.exports = UserSettings;
