const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const DataPoint = {
  insert(userId, sourceName, dataType, value, timestamp) {
    const id = uuidv4();
    const ts = timestamp instanceof Date ? timestamp.toISOString() : (timestamp || new Date().toISOString());
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    db.prepare('INSERT INTO data_points (id,user_id,source_name,data_type,value,timestamp) VALUES (?,?,?,?,?,?)')
      .run(id, userId, sourceName, dataType, valueStr, ts);
    return Promise.resolve(db.prepare('SELECT * FROM data_points WHERE id=?').get(id));
  },

  getLatest(userId, sourceName, dataType, limit = 1) {
    const rows = db.prepare(
      'SELECT * FROM data_points WHERE user_id=? AND source_name=? AND data_type=? ORDER BY timestamp DESC LIMIT ?'
    ).all(userId, sourceName, dataType, limit);
    return Promise.resolve(rows.map(parseValue));
  },

  getRange(userId, sourceName, dataType, startDate, endDate) {
    const rows = db.prepare(
      'SELECT * FROM data_points WHERE user_id=? AND source_name=? AND data_type=? AND timestamp BETWEEN ? AND ? ORDER BY timestamp DESC'
    ).all(userId, sourceName, dataType, startDate, endDate);
    return Promise.resolve(rows.map(parseValue));
  },
};

const parseValue = (row) => {
  try { return { ...row, value: JSON.parse(row.value) }; } catch { return row; }
};

module.exports = DataPoint;
