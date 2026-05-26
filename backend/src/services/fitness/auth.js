const axios = require('axios');
const env = require('../../config/env');
const DataSource = require('../../models/DataSource');
const AppError = require('../../utils/errorHandler');

const getAuthUrl = (userId) => {
  const scopes = 'activity heartrate sleep weight';
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.FITBIT_CLIENT_ID,
    redirect_uri: env.FITBIT_REDIRECT_URI,
    scope: scopes,
    state: userId,
  });
  return `https://www.fitbit.com/oauth2/authorize?${params}`;
};

const exchangeCode = async (code) => {
  const credentials = Buffer.from(`${env.FITBIT_CLIENT_ID}:${env.FITBIT_CLIENT_SECRET}`).toString('base64');
  const params = new URLSearchParams({
    client_id: env.FITBIT_CLIENT_ID,
    grant_type: 'authorization_code',
    redirect_uri: env.FITBIT_REDIRECT_URI,
    code,
  });

  const { data } = await axios.post('https://api.fitbit.com/oauth2/token', params, {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return data;
};

const refreshAccessToken = async (userId) => {
  const source = await DataSource.findOne(userId, 'fitness');
  if (!source?.refresh_token) throw new AppError('Fitbit not connected', 400);

  const credentials = Buffer.from(`${env.FITBIT_CLIENT_ID}:${env.FITBIT_CLIENT_SECRET}`).toString('base64');
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: source.refresh_token,
  });

  const { data } = await axios.post('https://api.fitbit.com/oauth2/token', params, {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  await DataSource.upsert(userId, 'fitness', {
    is_enabled: true,
    access_token: data.access_token,
    refresh_token: data.refresh_token || source.refresh_token,
    token_expires_at: new Date(Date.now() + data.expires_in * 1000),
  });

  return data.access_token;
};

const getValidToken = async (userId) => {
  const source = await DataSource.findOne(userId, 'fitness');
  if (!source?.access_token) throw new AppError('Fitbit not connected', 400);

  if (source.token_expires_at && new Date(source.token_expires_at) < new Date()) {
    return refreshAccessToken(userId);
  }
  return source.access_token;
};

module.exports = { getAuthUrl, exchangeCode, refreshAccessToken, getValidToken };
