const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const env = require('../config/env');
const { verifyRefreshToken } = require('../utils/jwt');
const { signToken } = require('../utils/jwt');
const { validateEmail, validateOTP } = require('../utils/validators');
const AppError = require('../utils/errorHandler');
const { otpLimiter } = require('../middleware/rateLimit');

// GET /api/auth/config — public: exposes Google client ID for frontend
router.get('/config', (req, res) => {
  res.json({ success: true, googleClientId: env.GOOGLE_CLIENT_ID || null });
});

// Backend URL used for the Google login callback (always backend port, never changes)
const googleLoginRedirectUri = () =>
  env.BACKEND_URL
    ? `${env.BACKEND_URL}/api/auth/google/login-callback`
    : `http://localhost:${env.PORT}/api/auth/google/login-callback`;

// GET /api/auth/google/url — generate Google OAuth URL (no login required)
router.get('/google/url', (req, res, next) => {
  try {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)
      return next(new AppError('Google OAuth not configured', 400));
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, googleLoginRedirectUri());
    const url = client.generateAuthUrl({
      access_type: 'online',
      scope: ['email', 'profile'],
      prompt: 'select_account',
    });
    res.json({ success: true, url });
  } catch (err) { next(err); }
});

// GET /api/auth/google/login-callback — Google redirects here after user picks account
router.get('/google/login-callback', async (req, res) => {
  const frontend = env.FRONTEND_URL || 'http://localhost:5173';
  try {
    const { code, error } = req.query;
    if (error) return res.redirect(`${frontend}/login?error=${encodeURIComponent(error)}`);

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, googleLoginRedirectUri());
    const { tokens } = await client.getToken(code);
    const ticket  = await client.verifyIdToken({ idToken: tokens.id_token, audience: env.GOOGLE_CLIENT_ID });
    const { email, given_name, family_name } = ticket.getPayload();

    const User = require('../models/User');
    const existing = await User.findByEmail(email.toLowerCase());

    if (existing) {
      if (!existing.is_active) return res.redirect(`${frontend}/login?error=Account+disabled`);
      const { signToken, signRefreshToken } = require('../utils/jwt');
      const token        = signToken({ id: existing.id, email: existing.email });
      const refreshToken = signRefreshToken({ id: existing.id });
      const p = new URLSearchParams({
        token, refreshToken,
        uid: existing.id,
        email: existing.email,
        fn: existing.first_name || '',
        ln: existing.last_name  || '',
      });
      return res.redirect(`${frontend}/login?${p}`);
    }

    // New user — generate OTP and redirect to OTP step
    const devOtp = await authService.createOtpForEmail(email.toLowerCase());
    const p = new URLSearchParams({ step: 'otp', email: email.toLowerCase() });
    if (devOtp) p.set('dev_otp', devOtp);
    if (given_name) p.set('fn', given_name);
    if (family_name) p.set('ln', family_name);
    res.redirect(`${frontend}/login?${p}`);
  } catch (err) {
    const frontend = env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontend}/login?error=Google+sign-in+failed`);
  }
});

// POST /api/auth/google-email — sign in with verified Google email
router.post('/google-email', async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !validateEmail(email)) return next(new AppError('Valid email required', 400));
    const existing = await require('../models/User').findByEmail(email.toLowerCase());
    if (existing) {
      if (!existing.is_active) return next(new AppError('Account is disabled', 403));
      const { signToken, signRefreshToken } = require('../utils/jwt');
      const token = signToken({ id: existing.id, email: existing.email });
      const refreshToken = signRefreshToken({ id: existing.id });
      return res.json({
        success: true, isNewUser: false, token, refreshToken,
        user: { id: existing.id, email: existing.email, first_name: existing.first_name, last_name: existing.last_name },
      });
    }
    // New user — send OTP
    const devOtp = await authService.createOtpForEmail(email.toLowerCase());
    res.json({ success: true, isNewUser: true, email: email.toLowerCase(), dev_otp: devOtp || undefined });
  } catch (err) { next(err); }
});

// POST /api/auth/google — Google Sign-In (ID token flow, kept for compatibility)
router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return next(new AppError('Google credential required', 400));
    const result = await authService.googleAuth(credential);
    if (result.isNewUser) {
      res.json({
        success: true,
        isNewUser: true,
        email: result.email,
        firstName: result.firstName,
        dev_otp: result.devOtp || undefined,
      });
    } else {
      res.json({
        success: true,
        isNewUser: false,
        token: result.token,
        refreshToken: result.refreshToken,
        user: { id: result.user.id, email: result.user.email, first_name: result.user.first_name, last_name: result.user.last_name },
      });
    }
  } catch (err) { next(err); }
});

// POST /api/auth/google/verify — verify OTP for new Google users
router.post('/google/verify', async (req, res, next) => {
  try {
    const { email, otp_code, first_name, last_name } = req.body;
    if (!validateEmail(email)) return next(new AppError('Invalid email', 400));
    if (!validateOTP(otp_code)) return next(new AppError('OTP must be 6 digits', 400));
    const result = await authService.completeGoogleSignup(email.toLowerCase(), otp_code, first_name, last_name);
    res.json({
      success: true,
      token: result.token,
      refreshToken: result.refreshToken,
      user: { id: result.user.id, email: result.user.email, first_name: result.user.first_name, last_name: result.user.last_name },
    });
  } catch (err) { next(err); }
});

// POST /api/auth/signup — send OTP
router.post('/signup', otpLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!validateEmail(email)) return next(new AppError('Invalid email', 400));
    const devOtp = await authService.signup(email.toLowerCase());
    res.json({
      success: true,
      message: devOtp ? 'OTP generated (dev mode)' : 'OTP sent to your email',
      dev_otp: devOtp || undefined,
    });
  } catch (err) { next(err); }
});

// POST /api/auth/verify-otp — verify OTP
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp_code, mode } = req.body;
    if (!validateEmail(email)) return next(new AppError('Invalid email', 400));
    if (!validateOTP(otp_code)) return next(new AppError('OTP must be 6 digits', 400));
    const result = mode === 'login'
      ? await authService.completeLogin(email.toLowerCase(), otp_code)
      : await authService.completeSignup(email.toLowerCase(), otp_code);
    res.json({
      success: true,
      token: result.token,
      refreshToken: result.refreshToken,
      user: { id: result.user.id, email: result.user.email, first_name: result.user.first_name, last_name: result.user.last_name },
    });
  } catch (err) { next(err); }
});

// POST /api/auth/login — send OTP for login
router.post('/login', otpLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!validateEmail(email)) return next(new AppError('Invalid email', 400));
    const devOtp = await authService.login(email.toLowerCase());
    res.json({
      success: true,
      message: devOtp ? 'OTP generated (dev mode)' : 'OTP sent to your email',
      otp_sent: true,
      dev_otp: devOtp || undefined,
    });
  } catch (err) { next(err); }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(new AppError('Refresh token required', 400));
    const decoded = verifyRefreshToken(refreshToken);
    const token = signToken({ id: decoded.id });
    res.json({ success: true, token });
  } catch (err) { next(new AppError('Invalid refresh token', 401)); }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => { res.json({ success: true }); });

module.exports = router;
