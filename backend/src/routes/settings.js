const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const UserSettings = require('../models/UserSettings');

// GET /api/settings/api-keys
router.get('/api-keys', authenticate, (req, res) => {
  const riotApiKey = UserSettings.get(req.user.id, 'riot_api_key');
  res.json({
    success: true,
    riotApiKey: riotApiKey ? riotApiKey.slice(0, 10) + '...' + riotApiKey.slice(-4) : null,
    hasRiotKey: !!riotApiKey,
  });
});

// POST /api/settings/api-keys
router.post('/api-keys', authenticate, (req, res, next) => {
  try {
    const { riotApiKey } = req.body;
    if (riotApiKey !== undefined) {
      if (riotApiKey) {
        UserSettings.set(req.user.id, 'riot_api_key', riotApiKey.trim());
      } else {
        UserSettings.delete(req.user.id, 'riot_api_key');
      }
    }
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
