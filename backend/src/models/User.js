const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const User = {
  findByEmail(email) {
    return Promise.resolve(db.prepare('SELECT * FROM users WHERE email=?').get(email) || null);
  },

  findById(id) {
    return Promise.resolve(
      db.prepare('SELECT id,email,first_name,last_name,created_at,is_active FROM users WHERE id=?').get(id) || null
    );
  },

  create({ email, password_hash, first_name, last_name }) {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO users (id,email,password_hash,first_name,last_name) VALUES (?,?,?,?,?)'
    ).run(id, email, password_hash, first_name || null, last_name || null);
    return Promise.resolve(db.prepare('SELECT id,email,first_name,last_name,created_at FROM users WHERE id=?').get(id));
  },

  update(id, { first_name, last_name }) {
    db.prepare("UPDATE users SET first_name=?,last_name=?,updated_at=datetime('now') WHERE id=?").run(first_name, last_name, id);
    return Promise.resolve(db.prepare('SELECT id,email,first_name,last_name FROM users WHERE id=?').get(id));
  },

  updatePassword(id, password_hash) {
    db.prepare("UPDATE users SET password_hash=?,updated_at=datetime('now') WHERE id=?").run(password_hash, id);
    return Promise.resolve();
  },
};

module.exports = User;
