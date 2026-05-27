const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
    // Dev mode: log OTPs to console instead of sending email
    return null;
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD },
    tls: { rejectUnauthorized: false },
  });
  return transporter;
};

const sendOTPEmail = async (email, otp) => {
  const t = getTransporter();

  if (!t) {
    logger.warn(`[DEV MODE] OTP for ${email}: ${otp}`);
    return false; // signals: no email sent, show OTP in browser
  }

  try {
    await t.sendMail({
      from: `"Personal Dashboard" <${env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Login Code',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9f9f9;border-radius:8px;">
          <h2 style="color:#1a1a1a">Your verification code</h2>
          <p style="color:#555">Use the code below to verify your email. It expires in 10 minutes.</p>
          <div style="font-size:40px;font-weight:bold;letter-spacing:8px;color:#6366f1;text-align:center;padding:24px 0;">${otp}</div>
          <p style="color:#888;font-size:12px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
    logger.info(`OTP email sent to ${email}`);
    return true;
  } catch (err) {
    logger.error('Failed to send OTP email:', err.message);
    logger.warn(`[FALLBACK] OTP for ${email}: ${otp}`);
    return false;
  }
};

module.exports = { sendOTPEmail };
