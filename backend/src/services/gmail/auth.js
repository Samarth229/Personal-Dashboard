const { google } = require('googleapis');
const env = require('../../config/env');
const DataSource = require('../../models/DataSource');
const AppError = require('../../utils/errorHandler');

const createOAuth2Client = () =>
  new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);

const getAuthUrl = (userId) => {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    state: userId,
    prompt: 'consent',
  });
};

const exchangeCode = async (code) => {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
};

const getAuthClient = async (userId) => {
  const source = await DataSource.findOne(userId, 'gmail');
  if (!source?.access_token) throw new AppError('Gmail not connected', 400);

  const client = createOAuth2Client();
  client.setCredentials({
    access_token: source.access_token,
    refresh_token: source.refresh_token,
  });

  client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await DataSource.upsert(userId, 'gmail', {
        is_enabled: true,
        access_token: tokens.access_token,
        refresh_token: source.refresh_token,
        token_expires_at: new Date(tokens.expiry_date),
      });
    }
  });

  return client;
};

module.exports = { getAuthUrl, exchangeCode, getAuthClient, createOAuth2Client };
