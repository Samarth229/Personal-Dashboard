const axios = require('axios');
const env = require('../../config/env');
const DataSource = require('../../models/DataSource');
const AppError = require('../../utils/errorHandler');

const getAuthUrl = (userId) => {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_REDIRECT_URI,
    scope: 'read:user repo',
    state: userId,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
};

const exchangeCode = async (code) => {
  const { data } = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_REDIRECT_URI,
    },
    { headers: { Accept: 'application/json' } }
  );
  return data;
};

const getValidToken = async (userId) => {
  const source = await DataSource.findOne(userId, 'github');
  if (!source?.access_token) throw new AppError('GitHub not connected', 400);
  return source.access_token;
};

module.exports = { getAuthUrl, exchangeCode, getValidToken };
