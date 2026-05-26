const DataSource = require('../models/DataSource');
const logger = require('../utils/logger');

const fetchers = {
  spotify: () => require('./spotify/fetch'),
  github: () => require('./github/fetch'),
  gmail: () => require('./gmail/fetch'),
  fitness: () => require('./fitness/fetch'),
  letterboxd: () => require('./letterboxd/fetch'),
  steam: () => require('./steam/fetch'),
  riot: () => require('./riot/fetch'),
};

const syncSource = async (userId, sourceName) => {
  const source = await DataSource.findOne(userId, sourceName);
  if (!source?.is_enabled || !source?.access_token) {
    logger.info(`Skipping ${sourceName} for user ${userId}: not connected`);
    return;
  }

  // For services that use access_token as an identifier (not an OAuth token)
  const identifierSources = new Set(['letterboxd', 'steam', 'riot']);

  await DataSource.updateStatus(userId, sourceName, 'syncing');
  try {
    const fetchModule = fetchers[sourceName]?.();
    if (!fetchModule) throw new Error(`Unknown source: ${sourceName}`);
    if (identifierSources.has(sourceName)) {
      await fetchModule.fetchAll(userId, source.access_token);
    } else {
      await fetchModule.fetchAll(userId);
    }
    await DataSource.updateStatus(userId, sourceName, 'success');
    logger.info(`Synced ${sourceName} for user ${userId}`);
  } catch (err) {
    await DataSource.updateStatus(userId, sourceName, 'error', err.message);
    logger.error(`Sync error [${sourceName}] user ${userId}:`, err.message);
    throw err;
  }
};

const syncAllSources = async (userId) => {
  const sources = await DataSource.findByUser(userId);
  const enabled = sources.filter((s) => s.is_enabled && s.access_token);
  await Promise.allSettled(enabled.map((s) => syncSource(userId, s.source_name)));
};

module.exports = { syncSource, syncAllSources };
