const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const gmailAuth = require('../services/gmail/auth');
const DataSource = require('../models/DataSource');
const DataPoint = require('../models/DataPoint');
const env = require('../config/env');
const AppError = require('../utils/errorHandler');

router.get('/auth', authenticate, (req, res, next) => {
  if (!env.isConfigured.gmail)
    return next(new AppError('Google API keys not configured in .env', 400));
  const url = gmailAuth.getAuthUrl(req.user.id);
  res.json({ success: true, url });
});

router.get('/callback', async (req, res, next) => {
  try {
    const { code, state: userId } = req.query;
    const tokens = await gmailAuth.exchangeCode(code);
    await DataSource.upsert(userId, 'gmail', {
      is_enabled: true,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(tokens.expiry_date),
    });
    const { syncSource } = require('../services/syncEngine');
    syncSource(userId, 'gmail').catch(() => {});
    res.redirect(`${env.FRONTEND_URL}/settings?connected=gmail`);
  } catch (err) { next(err); }
});

router.get('/details', authenticate, async (req, res, next) => {
  try {
    const { fetchAll } = require('../services/gmail/fetch');
    const data = await fetchAll(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/cached', authenticate, async (req, res, next) => {
  try {
    const [stats, senders] = await Promise.all([
      DataPoint.getLatest(req.user.id, 'gmail', 'stats'),
      DataPoint.getLatest(req.user.id, 'gmail', 'top_senders'),
    ]);
    res.json({ success: true, data: { stats: stats[0]?.value, topSenders: senders[0]?.value } });
  } catch (err) { next(err); }
});

module.exports = router;
