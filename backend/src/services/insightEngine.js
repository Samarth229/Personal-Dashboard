const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const DataPoint = require('../models/DataPoint');
const logger = require('../utils/logger');

const detectAnomalies = async (userId) => {
  const insights = [];

  try {
    const steps = await DataPoint.getLatest(userId, 'fitness', 'steps', 7);
    if (steps.length >= 3) {
      const values = steps.map((s) => parseInt(Array.isArray(s.value) ? s.value[0]?.value : s.value?.value || 0)).filter(Boolean);
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const latest = values[0];
        if (latest < avg * 0.5 && avg > 2000) {
          insights.push({
            insight_type: 'anomaly',
            title: 'Low Step Count Detected',
            description: `Your steps today (${latest.toLocaleString()}) are below your 7-day average (${Math.round(avg).toLocaleString()}).`,
            severity: 'warning',
            data: JSON.stringify({ current: latest, average: Math.round(avg) }),
          });
        }
      }
    }

    const tracks = await DataPoint.getLatest(userId, 'spotify', 'top_tracks');
    if (tracks[0]?.value?.length > 0) {
      insights.push({
        insight_type: 'trend',
        title: 'Music Taste Snapshot',
        description: `Your top track is "${tracks[0].value[0]?.name}" by ${tracks[0].value[0]?.artists?.[0]?.name}.`,
        severity: 'info',
        data: JSON.stringify({ topTrack: tracks[0].value[0] }),
      });
    }

    const contributions = await DataPoint.getLatest(userId, 'github', 'contributions');
    if (contributions[0]?.value) {
      const { commitCount } = contributions[0].value;
      if (commitCount === 0) {
        insights.push({
          insight_type: 'trend',
          title: 'No Recent GitHub Activity',
          description: 'No commits detected in the last sync. Keep up the coding streak!',
          severity: 'info',
          data: JSON.stringify({ commitCount }),
        });
      }
    }
  } catch (err) {
    logger.error('Insight engine error:', err.message);
  }

  return insights;
};

const saveInsights = (userId, insights) => {
  const insert = db.prepare(
    'INSERT INTO insights (id,user_id,insight_type,title,description,data,severity) VALUES (?,?,?,?,?,?,?)'
  );
  for (const i of insights) {
    insert.run(uuidv4(), userId, i.insight_type, i.title, i.description || null, i.data || null, i.severity || 'info');
  }
  return Promise.resolve();
};

const getInsights = (userId, limit = 20) => {
  const rows = db.prepare(
    'SELECT * FROM insights WHERE user_id=? ORDER BY created_at DESC LIMIT ?'
  ).all(userId, limit);
  return Promise.resolve(rows.map((r) => ({ ...r, is_read: !!r.is_read, data: r.data ? JSON.parse(r.data) : null })));
};

const markRead = (userId, insightId) => {
  db.prepare('UPDATE insights SET is_read=1 WHERE id=? AND user_id=?').run(insightId, userId);
  return Promise.resolve();
};

const generateAndSave = async (userId) => {
  const insights = await detectAnomalies(userId);
  if (insights.length > 0) await saveInsights(userId, insights);
  return insights;
};

module.exports = { detectAnomalies, saveInsights, getInsights, markRead, generateAndSave };
