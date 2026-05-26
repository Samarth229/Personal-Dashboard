const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signToken = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE });

const signRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRE });

const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

module.exports = { signToken, signRefreshToken, verifyToken, verifyRefreshToken };
