const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const User = require('../models/User');
const DataSource = require('../models/DataSource');
const { sendOTPEmail } = require('./emailService');
const { signToken, signRefreshToken } = require('../utils/jwt');
const AppError = require('../utils/errorHandler');
const logger = require('../utils/logger');

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const createAndSendOTP = async (email) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  db.prepare("UPDATE otp_tokens SET is_used=1 WHERE email=?").run(email);
  db.prepare('INSERT INTO otp_tokens (id,email,otp_code,expires_at) VALUES (?,?,?,?)').run(uuidv4(), email, otp, expiresAt);

  const emailSent = await sendOTPEmail(email, otp);
  logger.info(`OTP created for ${email}`);
  // Return otp only when email is not configured (dev mode)
  return emailSent ? null : otp;
};

const verifyOTP = (email, otpCode) => {
  const row = db.prepare(
    "SELECT * FROM otp_tokens WHERE email=? AND otp_code=? AND is_used=0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1"
  ).get(email, otpCode);

  if (!row) throw new AppError('Invalid or expired OTP', 400);
  db.prepare('UPDATE otp_tokens SET is_used=1 WHERE id=?').run(row.id);
  return true;
};

const signup = async (email) => {
  const existing = await User.findByEmail(email);
  if (existing) throw new AppError('Email already registered', 409);
  const devOtp = await createAndSendOTP(email);
  return devOtp;
};

const completeSignup = async (email, otpCode) => {
  verifyOTP(email, otpCode);

  const existing = await User.findByEmail(email);
  if (existing) throw new AppError('Email already registered', 409);

  const user = await User.create({ email, password_hash: null });
  await DataSource.initDefaults(user.id);

  const token = signToken({ id: user.id, email: user.email });
  const refreshToken = signRefreshToken({ id: user.id });
  return { user, token, refreshToken };
};

const login = async (email) => {
  const user = await User.findByEmail(email);
  if (!user) throw new AppError('No account found with this email', 404);
  if (!user.is_active) throw new AppError('Account is disabled', 403);
  const devOtp = await createAndSendOTP(email);
  return devOtp;
};

const completeLogin = async (email, otpCode) => {
  verifyOTP(email, otpCode);

  const user = await User.findByEmail(email);
  if (!user) throw new AppError('User not found', 404);

  const token = signToken({ id: user.id, email: user.email });
  const refreshToken = signRefreshToken({ id: user.id });
  return { user, token, refreshToken };
};

const createOtpForEmail = async (email) => {
  return createAndSendOTP(email);
};

const googleAuth = async (credential) => {
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  let email, firstName;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    email = payload.email;
    firstName = payload.given_name || payload.name?.split(' ')[0] || '';
  } catch {
    throw new AppError('Invalid Google credential', 401);
  }

  if (!email) throw new AppError('Could not get email from Google', 400);

  const existing = await User.findByEmail(email.toLowerCase());

  if (existing) {
    if (!existing.is_active) throw new AppError('Account is disabled', 403);
    const token = signToken({ id: existing.id, email: existing.email });
    const refreshToken = signRefreshToken({ id: existing.id });
    logger.info(`Google login: ${email}`);
    return { isNewUser: false, user: existing, token, refreshToken };
  }

  // New user — send OTP to verify email ownership
  const devOtp = await createAndSendOTP(email.toLowerCase());
  logger.info(`Google new user OTP: ${email}`);
  return { isNewUser: true, email: email.toLowerCase(), firstName, devOtp };
};

const completeGoogleSignup = async (email, otpCode, firstName, lastName) => {
  verifyOTP(email, otpCode);
  const existing = await User.findByEmail(email);
  if (existing) {
    // Race condition — user registered between google check and OTP
    const token = signToken({ id: existing.id, email: existing.email });
    const refreshToken = signRefreshToken({ id: existing.id });
    return { user: existing, token, refreshToken };
  }
  const nameParts = email.split('@')[0].split('.');
  const user = await User.create({
    email,
    password_hash: null,
    first_name: firstName || nameParts[0] || '',
    last_name: lastName || nameParts[1] || '',
  });
  await DataSource.initDefaults(user.id);
  const token = signToken({ id: user.id, email: user.email });
  const refreshToken = signRefreshToken({ id: user.id });
  return { user, token, refreshToken };
};

module.exports = { signup, completeSignup, login, completeLogin, googleAuth, completeGoogleSignup, createOtpForEmail };
