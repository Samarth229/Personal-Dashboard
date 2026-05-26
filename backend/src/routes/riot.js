const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const DataPoint = require('../models/DataPoint');
const DataSource = require('../models/DataSource');
const AppError = require('../utils/errorHandler');
const env = require('../config/env');
const logger = require('../utils/logger');

// Summoner name stored in access_token field (no OAuth)

router.post('/connect', authenticate, async (req, res, next) => {
  try {
    if (!env.isConfigured.riot)
      return next(new AppError('Riot API key not configured in .env', 400));

    const { summonerName } = req.body;
    if (!summonerName) return next(new AppError('Summoner name required (e.g. GameName#TAG)', 400));

    await DataSource.upsert(req.user.id, 'riot', {
      is_enabled: true,
      access_token: summonerName.trim(),
    });

    const { fetchAll } = require('../services/riot/fetch');
    fetchAll(req.user.id, summonerName)
      .then(() => DataSource.updateStatus(req.user.id, 'riot', 'success'))
      .catch((err) => {
        logger.error('Riot auto-sync failed:', err.message);
        DataSource.updateStatus(req.user.id, 'riot', 'error', err.message);
      });

    res.json({ success: true, message: 'Riot connected', summonerName });
  } catch (err) { next(err); }
});

router.delete('/disconnect', authenticate, async (req, res, next) => {
  try {
    await DataSource.upsert(req.user.id, 'riot', { is_enabled: false, access_token: null });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.get('/cached', authenticate, async (req, res, next) => {
  try {
    const source = await DataSource.findOne(req.user.id, 'riot');
    if (!source?.is_enabled) return res.json({ success: true, data: null });

    const [summoner, ranked, history, stats] = await Promise.all([
      DataPoint.getLatest(req.user.id, 'riot', 'summoner'),
      DataPoint.getLatest(req.user.id, 'riot', 'ranked_stats'),
      DataPoint.getLatest(req.user.id, 'riot', 'match_history'),
      DataPoint.getLatest(req.user.id, 'riot', 'stats'),
    ]);

    res.json({
      success: true,
      data: {
        summonerName: source.access_token,
        syncStatus: source.sync_status || null,
        syncError: source.error_message || null,
        summoner: summoner[0]?.value || null,
        rankedStats: ranked[0]?.value || [],
        matchHistory: history[0]?.value || [],
        stats: stats[0]?.value || null,
      },
    });
  } catch (err) { next(err); }
});

router.post('/sync', authenticate, async (req, res, next) => {
  try {
    const source = await DataSource.findOne(req.user.id, 'riot');
    if (!source?.is_enabled || !source?.access_token)
      return next(new AppError('Riot not connected', 400));

    const { fetchAll } = require('../services/riot/fetch');
    const data = await fetchAll(req.user.id, source.access_token);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
