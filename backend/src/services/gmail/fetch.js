const { google } = require('googleapis');
const { getAuthClient } = require('./auth');
const DataPoint = require('../../models/DataPoint');

const fetchEmailStats = async (userId) => {
  const auth = await getAuthClient(userId);
  const gmail = google.gmail({ version: 'v1', auth });

  const profile = await gmail.users.getProfile({ userId: 'me' });
  const [inbox, unread] = await Promise.all([
    gmail.users.messages.list({ userId: 'me', maxResults: 1, labelIds: ['INBOX'] }),
    gmail.users.messages.list({ userId: 'me', maxResults: 1, labelIds: ['UNREAD'] }),
  ]);

  const stats = {
    totalMessages: profile.data.messagesTotal,
    threadsTotal: profile.data.threadsTotal,
    inboxCount: inbox.data.resultSizeEstimate,
    unreadCount: unread.data.resultSizeEstimate,
    email: profile.data.emailAddress,
  };

  await DataPoint.insert(userId, 'gmail', 'stats', stats, new Date());
  return stats;
};

const fetchTopSenders = async (userId) => {
  const auth = await getAuthClient(userId);
  const gmail = google.gmail({ version: 'v1', auth });

  const messages = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 50,
    labelIds: ['INBOX'],
  });

  const senderMap = {};
  for (const msg of (messages.data.messages || []).slice(0, 20)) {
    try {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['From'],
      });
      const from = detail.data.payload.headers.find((h) => h.name === 'From')?.value || '';
      const match = from.match(/<(.+)>/) || [null, from];
      const email = match[1].trim();
      senderMap[email] = (senderMap[email] || 0) + 1;
    } catch {}
  }

  const topSenders = Object.entries(senderMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([email, count]) => ({ email, count }));

  await DataPoint.insert(userId, 'gmail', 'top_senders', topSenders, new Date());
  return topSenders;
};

const fetchAll = async (userId) => {
  const [stats, topSenders] = await Promise.all([fetchEmailStats(userId), fetchTopSenders(userId)]);
  return { stats, topSenders };
};

module.exports = { fetchEmailStats, fetchTopSenders, fetchAll };
