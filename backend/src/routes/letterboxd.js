const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const DataPoint = require('../models/DataPoint');
const DataSource = require('../models/DataSource');
const AppError = require('../utils/errorHandler');
const logger = require('../utils/logger');

// Letterboxd username is stored as metadata on the data source
// We store it in access_token field (no OAuth — just a username)

router.post('/connect', authenticate, async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username) return next(new AppError('Letterboxd username required', 400));

    await DataSource.upsert(req.user.id, 'letterboxd', {
      is_enabled: true,
      access_token: username.toLowerCase().trim(),
    });

    const { fetchAll } = require('../services/letterboxd/fetch');
    fetchAll(req.user.id, username).catch((err) =>
      logger.error('Letterboxd auto-sync failed:', err.message)
    );

    res.json({ success: true, message: 'Letterboxd connected', username });
  } catch (err) { next(err); }
});

router.delete('/disconnect', authenticate, async (req, res, next) => {
  try {
    await DataSource.upsert(req.user.id, 'letterboxd', { is_enabled: false, access_token: null });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.get('/cached', authenticate, async (req, res, next) => {
  try {
    const source = await DataSource.findOne(req.user.id, 'letterboxd');
    if (!source?.is_enabled) return res.json({ success: true, data: null });

    const [films, stats] = await Promise.all([
      DataPoint.getLatest(req.user.id, 'letterboxd', 'recent_films'),
      DataPoint.getLatest(req.user.id, 'letterboxd', 'stats'),
    ]);
    res.json({
      success: true,
      data: {
        username: source.access_token,
        recentFilms: films[0]?.value || [],
        stats: stats[0]?.value || null,
      },
    });
  } catch (err) { next(err); }
});

router.post('/sync', authenticate, async (req, res, next) => {
  try {
    const source = await DataSource.findOne(req.user.id, 'letterboxd');
    if (!source?.is_enabled || !source?.access_token)
      return next(new AppError('Letterboxd not connected', 400));

    const { fetchAll } = require('../services/letterboxd/fetch');
    const data = await fetchAll(req.user.id, source.access_token);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
