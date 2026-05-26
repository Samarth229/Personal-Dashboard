const axios = require('axios');
const env = require('../../config/env');
const DataPoint = require('../../models/DataPoint');

const steamApi = async (path, params = {}) => {
  const { data } = await axios.get(`https://api.steampowered.com${path}`, {
    params: { key: env.STEAM_API_KEY, format: 'json', ...params },
    timeout: 10000,
  });
  return data.response || data;
};

const fetchProfile = async (steamId) => {
  const data = await steamApi('/ISteamUser/GetPlayerSummaries/v2/', { steamids: steamId });
  return data.players?.[0] || null;
};

const fetchRecentGames = async (steamId) => {
  const data = await steamApi('/IPlayerService/GetRecentlyPlayedGames/v1/', {
    steamid: steamId,
    count: 10,
  });
  return data.games || [];
};

const fetchOwnedGames = async (steamId) => {
  const data = await steamApi('/IPlayerService/GetOwnedGames/v1/', {
    steamid: steamId,
    include_appinfo: 1,
    include_played_free_games: 1,
  });
  return data.games || [];
};

const fetchAchievements = async (steamId, appId) => {
  try {
    const data = await steamApi('/ISteamUserStats/GetPlayerAchievements/v1/', {
      steamid: steamId,
      appid: appId,
    });
    const ach = data.playerstats?.achievements || [];
    const unlocked = ach.filter((a) => a.achieved === 1).length;
    return { total: ach.length, unlocked };
  } catch {
    return { total: 0, unlocked: 0 };
  }
};

const fetchAll = async (userId, steamId) => {
  if (!steamId) throw new Error('Steam ID not configured');

  const [profile, recentGames, ownedGames] = await Promise.all([
    fetchProfile(steamId),
    fetchRecentGames(steamId),
    fetchOwnedGames(steamId),
  ]);

  const totalPlaytime = ownedGames.reduce((s, g) => s + (g.playtime_forever || 0), 0);
  const topGames = [...ownedGames]
    .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
    .slice(0, 10)
    .map((g) => ({ ...g, playtime_hours: Math.round((g.playtime_forever || 0) / 60) }));

  const stats = {
    totalGames: ownedGames.length,
    totalPlaytimeHours: Math.round(totalPlaytime / 60),
    recentGamesCount: recentGames.length,
  };

  await Promise.all([
    DataPoint.insert(userId, 'steam', 'profile', profile, new Date()),
    DataPoint.insert(userId, 'steam', 'recent_games', recentGames.map((g) => ({
      ...g,
      playtime_hours: Math.round((g.playtime_2weeks || 0) / 60),
    })), new Date()),
    DataPoint.insert(userId, 'steam', 'top_games', topGames, new Date()),
    DataPoint.insert(userId, 'steam', 'stats', stats, new Date()),
  ]);

  return { profile, recentGames, topGames, stats };
};

module.exports = { fetchAll, fetchProfile, fetchRecentGames, fetchOwnedGames };
