const axios = require('axios');
const { getValidToken } = require('./auth');
const DataPoint = require('../../models/DataPoint');

const githubApi = async (userId, path) => {
  const token = await getValidToken(userId);
  const { data } = await axios.get(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  return data;
};

const fetchProfile = async (userId) => {
  const data = await githubApi(userId, '/user');
  await DataPoint.insert(userId, 'github', 'profile', data, new Date());
  return data;
};

const fetchRepos = async (userId) => {
  const data = await githubApi(userId, '/user/repos?per_page=50&sort=updated');
  await DataPoint.insert(userId, 'github', 'repos', data, new Date());
  return data;
};

const fetchContributions = async (userId) => {
  const profile = await githubApi(userId, '/user');
  const events = await githubApi(userId, `/users/${profile.login}/events?per_page=100`);
  const pushEvents = events.filter((e) => e.type === 'PushEvent');
  const commitCount = pushEvents.reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0);

  const contributions = { events: pushEvents.slice(0, 20), commitCount, username: profile.login };
  await DataPoint.insert(userId, 'github', 'contributions', contributions, new Date());
  return contributions;
};

const fetchLanguages = async (userId) => {
  const repos = await githubApi(userId, '/user/repos?per_page=50&sort=updated');
  const langMap = {};

  for (const repo of repos.slice(0, 10)) {
    try {
      const langs = await githubApi(userId, `/repos/${repo.full_name}/languages`);
      for (const [lang, bytes] of Object.entries(langs)) {
        langMap[lang] = (langMap[lang] || 0) + bytes;
      }
    } catch {}
  }

  await DataPoint.insert(userId, 'github', 'languages', langMap, new Date());
  return langMap;
};

const fetchAll = async (userId) => {
  const [profile, repos, contributions, languages] = await Promise.all([
    fetchProfile(userId),
    fetchRepos(userId),
    fetchContributions(userId),
    fetchLanguages(userId),
  ]);
  return { profile, repos, contributions, languages };
};

module.exports = { fetchProfile, fetchRepos, fetchContributions, fetchLanguages, fetchAll };
