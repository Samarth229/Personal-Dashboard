const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const githubAuth = require('../services/github/auth');
const DataSource = require('../models/DataSource');
const DataPoint = require('../models/DataPoint');
const env = require('../config/env');
const AppError = require('../utils/errorHandler');
const logger = require('../utils/logger');

router.get('/auth', authenticate, (req, res, next) => {
  if (!env.isConfigured.github)
    return next(new AppError('GitHub API keys not configured in .env', 400));
  const url = githubAuth.getAuthUrl(req.user.id);
  res.json({ success: true, url });
});

router.get('/callback', async (req, res, next) => {
  try {
    const { code, state: userId } = req.query;
    const tokens = await githubAuth.exchangeCode(code);
    await DataSource.upsert(userId, 'github', {
      is_enabled: true,
      access_token: tokens.access_token,
      refresh_token: null,
      token_expires_at: null,
    });

    // Auto-sync immediately after connecting
    const { syncSource } = require('../services/syncEngine');
    syncSource(userId, 'github').catch((err) =>
      logger.error('Auto-sync failed after GitHub connect:', err.message)
    );

    res.redirect(`${env.FRONTEND_URL}/settings?connected=github`);
  } catch (err) { next(err); }
});

router.get('/details', authenticate, async (req, res, next) => {
  try {
    const data = await require('../services/github/fetch').fetchAll(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/cached', authenticate, async (req, res, next) => {
  try {
    const [profile, contributions, languages, repos] = await Promise.all([
      DataPoint.getLatest(req.user.id, 'github', 'profile'),
      DataPoint.getLatest(req.user.id, 'github', 'contributions'),
      DataPoint.getLatest(req.user.id, 'github', 'languages'),
      DataPoint.getLatest(req.user.id, 'github', 'repos'),
    ]);
    res.json({
      success: true,
      data: {
        profile: profile[0]?.value,
        contributions: contributions[0]?.value,
        languages: languages[0]?.value,
        repos: repos[0]?.value,
      },
    });
  } catch (err) { next(err); }
});

router.get('/repos', authenticate, async (req, res, next) => {
  try {
    const [repos] = await Promise.all([DataPoint.getLatest(req.user.id, 'github', 'repos')]);
    res.json({ success: true, data: repos[0]?.value || [] });
  } catch (err) { next(err); }
});

router.post('/sync', authenticate, async (req, res, next) => {
  try {
    const data = await require('../services/github/fetch').fetchAll(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
