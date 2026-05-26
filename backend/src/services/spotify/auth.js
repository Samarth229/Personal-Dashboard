const axios = require('axios');
const env = require('../../config/env');
const DataSource = require('../../models/DataSource');
const AppError = require('../../utils/errorHandler');

const getAuthUrl = (userId, showDialog = false) => {
  const scopes = 'user-top-read user-read-recently-played user-read-playback-state';
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: env.SPOTIFY_REDIRECT_URI,
    state: userId,
    ...(showDialog && { show_dialog: 'true' }),
  });
  return `https://accounts.spotify.com/authorize?${params}`;
};

const exchangeCode = async (code) => {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.SPOTIFY_REDIRECT_URI,
  });

  const credentials = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const { data } = await axios.post('https://accounts.spotify.com/api/token', params, {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return data;
};

const refreshAccessToken = async (userId) => {
  const source = await DataSource.findOne(userId, 'spotify');
  if (!source?.refresh_token) throw new AppError('Spotify not connected', 400);

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: source.refresh_token,
  });

  const credentials = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const { data } = await axios.post('https://accounts.spotify.com/api/token', params, {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  await DataSource.upsert(userId, 'spotify', {
    is_enabled: true,
    access_token: data.access_token,
    refresh_token: source.refresh_token,
    token_expires_at: new Date(Date.now() + data.expires_in * 1000),
  });

  return data.access_token;
};

const getValidToken = async (userId) => {
  const source = await DataSource.findOne(userId, 'spotify');
  if (!source?.access_token) throw new AppError('Spotify not connected', 400);

  if (source.token_expires_at && new Date(source.token_expires_at) < new Date()) {
    return refreshAccessToken(userId);
  }
  return source.access_token;
};

module.exports = { getAuthUrl, exchangeCode, refreshAccessToken, getValidToken };
