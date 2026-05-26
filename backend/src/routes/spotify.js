const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const spotifyAuth = require('../services/spotify/auth');
const DataSource = require('../models/DataSource');
const DataPoint = require('../models/DataPoint');
const env = require('../config/env');
const AppError = require('../utils/errorHandler');

router.get('/auth', authenticate, (req, res, next) => {
  if (!env.isConfigured.spotify)
    return next(new AppError('Spotify API keys not configured in .env', 400));
  const url = spotifyAuth.getAuthUrl(req.user.id, req.query.reauth === 'true');
  res.json({ success: true, url });
});

router.get('/callback', async (req, res, next) => {
  try {
    const { code, state: userId } = req.query;
    const tokens = await spotifyAuth.exchangeCode(code);
    await DataSource.upsert(userId, 'spotify', {
      is_enabled: true,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
    });
    const { syncSource } = require('../services/syncEngine');
    syncSource(userId, 'spotify').catch(() => {});
    res.redirect(`${env.FRONTEND_URL}/settings?connected=spotify`);
  } catch (err) { next(err); }
});

router.get('/details', authenticate, async (req, res, next) => {
  try {
    const { fetchAll } = require('../services/spotify/fetch');
    const data = await fetchAll(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/cached', authenticate, async (req, res, next) => {
  try {
    const [artists, tracks, recent] = await Promise.all([
      DataPoint.getLatest(req.user.id, 'spotify', 'top_artists'),
      DataPoint.getLatest(req.user.id, 'spotify', 'top_tracks'),
      DataPoint.getLatest(req.user.id, 'spotify', 'recently_played'),
    ]);
    res.json({
      success: true,
      data: {
        topArtists: artists[0]?.value,
        topTracks: tracks[0]?.value,
        recentlyPlayed: recent[0]?.value,
      },
    });
  } catch (err) { next(err); }
});

router.get('/top-artists', authenticate, async (req, res, next) => {
  try {
    const { timeRange = 'medium_term' } = req.query;
    const { fetchTopArtists } = require('../services/spotify/fetch');
    const data = await fetchTopArtists(req.user.id, timeRange);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/top-tracks', authenticate, async (req, res, next) => {
  try {
    const { timeRange = 'medium_term' } = req.query;
    const { fetchTopTracks } = require('../services/spotify/fetch');
    const data = await fetchTopTracks(req.user.id, timeRange);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/recently-played', authenticate, async (req, res, next) => {
  try {
    const { fetchRecentlyPlayed } = require('../services/spotify/fetch');
    const data = await fetchRecentlyPlayed(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
