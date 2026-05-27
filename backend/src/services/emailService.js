const { Resend } = require('resend');
const env = require('../config/env');
const logger = require('../utils/logger');

const sendOTPEmail = async (email, otp) => {
  if (!env.RESEND_API_KEY) {
    logger.warn(`[DEV MODE] OTP for ${email}: ${otp}`);
    return false;
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Personal Dashboard <onboarding@resend.dev>',
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
