require('dotenv').config();
const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const initDB = require('./database/init');
const { startCronJobs } = require('./services/cronJobs');

const start = () => {
  initDB();
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    startCronJobs();
  });
};

start();
