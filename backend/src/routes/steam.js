const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const DataPoint = require('../models/DataPoint');
const DataSource = require('../models/DataSource');
const AppError = require('../utils/errorHandler');
const env = require('../config/env');
const logger = require('../utils/logger');

// Steam ID stored in access_token field (no OAuth — Steam API key is global)

router.post('/connect', authenticate, async (req, res, next) => {
  try {
    if (!env.isConfigured.steam)
      return next(new AppError('Steam API key not configured in .env', 400));

    const { steamId } = req.body;
    if (!steamId) return next(new AppError('Steam ID required', 400));

    await DataSource.upsert(req.user.id, 'steam', {
      is_enabled: true,
      access_token: steamId.trim(),
    });

    const { fetchAll } = require('../services/steam/fetch');
    fetchAll(req.user.id, steamId)
      .then(() => DataSource.updateStatus(req.user.id, 'steam', 'success'))
      .catch((err) => {
        logger.error('Steam auto-sync failed:', err.message);
        DataSource.updateStatus(req.user.id, 'steam', 'error', err.message);
      });

    res.json({ success: true, message: 'Steam connected', steamId });
  } catch (err) { next(err); }
});

router.delete('/disconnect', authenticate, async (req, res, next) => {
  try {
    await DataSource.upsert(req.user.id, 'steam', { is_enabled: false, access_token: null });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.get('/cached', authenticate, async (req, res, next) => {
  try {
    const source = await DataSource.findOne(req.user.id, 'steam');
    if (!source?.is_enabled) return res.json({ success: true, data: null });

    const [profile, recentGames, topGames, stats] = await Promise.all([
      DataPoint.getLatest(req.user.id, 'steam', 'profile'),
      DataPoint.getLatest(req.user.id, 'steam', 'recent_games'),
      DataPoint.getLatest(req.user.id, 'steam', 'top_games'),
      DataPoint.getLatest(req.user.id, 'steam', 'stats'),
    ]);

    res.json({
      success: true,
      data: {
        syncStatus: source.sync_status || null,
        syncError: source.error_message || null,
        profile: profile[0]?.value || null,
        recentGames: recentGames[0]?.value || [],
        topGames: topGames[0]?.value || [],
        stats: stats[0]?.value || null,
      },
    });
  } catch (err) { next(err); }
});

router.post('/sync', authenticate, async (req, res, next) => {
  try {
    const source = await DataSource.findOne(req.user.id, 'steam');
    if (!source?.is_enabled || !source?.access_token)
      return next(new AppError('Steam not connected', 400));

    const { fetchAll } = require('../services/steam/fetch');
    const data = await fetchAll(req.user.id, source.access_token);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
