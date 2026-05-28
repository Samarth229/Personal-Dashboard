const sgMail = require('@sendgrid/mail');
const env = require('../config/env');
const logger = require('../utils/logger');

const sendOTPEmail = async (email, otp) => {
  if (!env.SENDGRID_API_KEY) {
    logger.warn(`[DEV MODE] OTP for ${email}: ${otp}`);
    return false;
  }

  try {
    sgMail.setApiKey(env.SENDGRID_API_KEY);
    await sgMail.send({
      from: { name: 'Personal Dashboard', email: 'samarthkadam3411@gmail.com' },
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
    const detail = err.response?.body?.errors?.[0]?.message || err.message || 'unknown error';
    logger.error('Failed to send OTP email: ' + detail);
    return false;
  }
};

module.exports = { sendOTPEmail };
