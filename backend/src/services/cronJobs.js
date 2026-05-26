const cron = require('node-cron');
const { db } = require('../config/database');
const { syncAllSources } = require('./syncEngine');
const logger = require('../utils/logger');

const startCronJobs = () => {
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Cron: Syncing all users');
    try {
      const users = db.prepare('SELECT id FROM users WHERE is_active=1').all();
      for (const user of users) {
        await syncAllSources(user.id).catch((err) =>
          logger.error(`Cron sync failed for ${user.id}:`, err.message)
        );
      }
    } catch (err) {
      logger.error('Cron error:', err.message);
    }
  });

  cron.schedule('0 0 * * *', () => {
    try {
      db.prepare("DELETE FROM otp_tokens WHERE expires_at < datetime('now', '-1 day')").run();
      logger.info('Cron: Cleaned expired OTPs');
    } catch (err) {
      logger.error('Cron cleanup error:', err.message);
    }
  });

  logger.info('Cron jobs started');
};

module.exports = { startCronJobs };
