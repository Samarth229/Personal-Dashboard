const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const fitnessAuth = require('../services/fitness/auth');
const DataSource = require('../models/DataSource');
const DataPoint = require('../models/DataPoint');
const env = require('../config/env');
const AppError = require('../utils/errorHandler');

router.get('/auth', authenticate, (req, res, next) => {
  if (!env.isConfigured.fitness)
    return next(new AppError('Fitbit API keys not configured in .env', 400));
  const url = fitnessAuth.getAuthUrl(req.user.id);
  res.json({ success: true, url });
});

router.get('/callback', async (req, res, next) => {
  try {
    const { code, state: userId } = req.query;
    const tokens = await fitnessAuth.exchangeCode(code);
    await DataSource.upsert(userId, 'fitness', {
      is_enabled: true,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
    });
    const { syncSource } = require('../services/syncEngine');
    syncSource(userId, 'fitness').catch(() => {});
    res.redirect(`${env.FRONTEND_URL}/settings?connected=fitness`);
  } catch (err) { next(err); }
});

router.get('/details', authenticate, async (req, res, next) => {
  try {
    const { fetchAll } = require('../services/fitness/fetch');
    const data = await fetchAll(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/cached', authenticate, async (req, res, next) => {
  try {
    const [steps, sleep, hr] = await Promise.all([
      DataPoint.getLatest(req.user.id, 'fitness', 'steps'),
      DataPoint.getLatest(req.user.id, 'fitness', 'sleep'),
      DataPoint.getLatest(req.user.id, 'fitness', 'heart_rate'),
    ]);
    res.json({ success: true, data: { steps: steps[0]?.value, sleep: sleep[0]?.value, heartRate: hr[0]?.value } });
  } catch (err) { next(err); }
});

module.exports = router;
