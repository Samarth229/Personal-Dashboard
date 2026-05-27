const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

const sendOTPEmail = async (email, otp) => {
  // Dev mode — no SMTP configured
  if (!env.BREVO_SMTP_USER || !env.BREVO_SMTP_PASS) {
    logger.warn(`[DEV MODE] OTP for ${email}: ${otp}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: env.BREVO_SMTP_USER, // your Brevo login email
        pass: env.BREVO_SMTP_PASS, // Brevo SMTP key (not your account password)
      },
    });

    await transporter.sendMail({
      from: `"Personal Dashboard" <${env.BREVO_SMTP_USER}>`,
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
    return false;
  }
};

module.exports = { sendOTPEmail };
