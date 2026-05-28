require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 5000,
  BACKEND_URL: process.env.BACKEND_URL || null, // e.g. https://your-app.up.railway.app
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_USER: process.env.DATABASE_USER || 'postgres',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || '',
  DATABASE_NAME: process.env.DATABASE_NAME || 'personal_dashboard',
  DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT) || 5432,

  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_change_me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',

  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,

  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_REDIRECT_URI: process.env.GITHUB_REDIRECT_URI,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,

  FITBIT_CLIENT_ID: process.env.FITBIT_CLIENT_ID,
  FITBIT_CLIENT_SECRET: process.env.FITBIT_CLIENT_SECRET,
  FITBIT_REDIRECT_URI: process.env.FITBIT_REDIRECT_URI,

  STEAM_API_KEY: process.env.STEAM_API_KEY,
  RIOT_API_KEY: process.env.RIOT_API_KEY,
  RIOT_REGION: process.env.RIOT_REGION || 'na1',
};

env.isConfigured = {
  spotify: !!(env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET),
  github: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
  gmail: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  fitness: !!(env.FITBIT_CLIENT_ID && env.FITBIT_CLIENT_SECRET),
  email: !!(env.EMAIL_USER && env.EMAIL_PASSWORD),
  steam: !!env.STEAM_API_KEY,
  riot: !!env.RIOT_API_KEY,
  letterboxd: true, // RSS-based, no API key needed
};

module.exports = env;
