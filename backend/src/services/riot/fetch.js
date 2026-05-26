const axios = require('axios');
const env = require('../../config/env');
const DataPoint = require('../../models/DataPoint');
const UserSettings = require('../../models/UserSettings');

const riotApi = async (cluster, path, apiKey) => {
  const { data } = await axios.get(`https://${cluster}.api.riotgames.com${path}`, {
    headers: { 'X-Riot-Token': apiKey },
    timeout: 10000,
  });
  return data;
};

// Platform routing: which server hosts the game (summoner, ranked data)
// Regional routing: which cluster hosts cross-region data (account, match)
// SEA-specific: account-v1 is blocked on 'sea' for dev keys — use 'asia' instead
const MATCH_ROUTES = {
  na1: 'americas', br1: 'americas', la1: 'americas', la2: 'americas',
  euw1: 'europe', eune1: 'europe', tr1: 'europe', ru: 'europe',
  kr: 'asia', jp1: 'asia',
  oc1: 'sea', ph2: 'sea', sg2: 'sea', th2: 'sea', tw2: 'sea', vn2: 'sea',
};

const ACCOUNT_ROUTES = {
  na1: 'americas', br1: 'americas', la1: 'americas', la2: 'americas',
  euw1: 'europe', eune1: 'europe', tr1: 'europe', ru: 'europe',
  kr: 'asia', jp1: 'asia',
  // SEA regions: use 'asia' — 'sea' cluster blocks account-v1 for dev keys
  oc1: 'asia', ph2: 'asia', sg2: 'asia', th2: 'asia', tw2: 'asia', vn2: 'asia',
};

const getMatchRoute = (region) => MATCH_ROUTES[region] || 'americas';
const getAccountRoute = (region) => ACCOUNT_ROUTES[region] || 'americas';

const fetchSummoner = async (region, summonerName, apiKey) => {
  const [gameName, tagLine] = summonerName.includes('#')
    ? summonerName.split('#')
    : [summonerName, region.toUpperCase()];

  const account = await riotApi(
    getAccountRoute(region),
    `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    apiKey
  );
  const summoner = await riotApi(region, `/lol/summoner/v4/summoners/by-puuid/${account.puuid}`, apiKey);
  return { ...summoner, gameName: account.gameName, tagLine: account.tagLine, puuid: account.puuid };
};

const fetchRankedStats = async (region, summonerId, apiKey) => {
  try {
    return await riotApi(region, `/lol/league/v4/entries/by-summoner/${summonerId}`, apiKey);
  } catch (err) {
    if (err.response?.status === 403 || err.response?.status === 404) return [];
    throw err;
  }
};

const fetchMatchHistory = async (region, puuid, summoner, apiKey, count = 10) => {
  const matchCluster = getMatchRoute(region);
  const matchIds = await riotApi(matchCluster, `/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`, apiKey);

  const matches = await Promise.all(
    matchIds.slice(0, 5).map((id) =>
      riotApi(matchCluster, `/lol/match/v5/matches/${id}`, apiKey).catch(() => null)
    )
  );
  const filtered = matches.filter(Boolean);

  // Extract summonerId from match participant data if not in summoner response
  let summonerIdFromMatch = null;
  if (!summoner?.id && filtered.length > 0) {
    for (const m of filtered) {
      const p = m.info?.participants?.find((p) => p.puuid === puuid);
      if (p?.summonerId) { summonerIdFromMatch = p.summonerId; break; }
    }
  }

  const formattedMatches = filtered.map((m) => {
    const p = m.info.participants.find((p) => p.puuid === puuid);
    return {
      matchId: m.metadata.matchId,
      gameMode: m.info.gameMode,
      gameDuration: m.info.gameDuration,
      gameCreation: m.info.gameCreation,
      win: p?.win,
      champion: p?.championName,
      kills: p?.kills,
      deaths: p?.deaths,
      assists: p?.assists,
      kda: p ? ((p.kills + p.assists) / Math.max(p.deaths, 1)).toFixed(2) : null,
    };
  });

  return { matches: formattedMatches, summonerIdFromMatch };
};

const fetchAll = async (userId, summonerName) => {
  if (!summonerName) throw new Error('Riot summoner name not configured');
  const region = env.RIOT_REGION;
  const apiKey = UserSettings.get(userId, 'riot_api_key') || env.RIOT_API_KEY;
  if (!apiKey) throw new Error('Riot API key not configured');

  const summoner = await fetchSummoner(region, summonerName, apiKey);
  const { matches: matchHistory, summonerIdFromMatch } = await fetchMatchHistory(region, summoner.puuid, summoner, apiKey);

  const summonerId = summoner.id || summonerIdFromMatch;
  const rankedStats = summonerId ? await fetchRankedStats(region, summonerId, apiKey) : [];

  const soloQueue = rankedStats.find((e) => e.queueType === 'RANKED_SOLO_5x5') || null;
  const wins = matchHistory.filter((m) => m.win).length;
  const stats = {
    summonerLevel: summoner.summonerLevel,
    soloRank: soloQueue ? `${soloQueue.tier} ${soloQueue.rank}` : 'Unranked',
    soloLP: soloQueue?.leaguePoints || 0,
    recentWinRate: matchHistory.length ? Math.round((wins / matchHistory.length) * 100) : 0,
    recentGames: matchHistory.length,
  };

  await Promise.all([
    DataPoint.insert(userId, 'riot', 'summoner', summoner, new Date()),
    DataPoint.insert(userId, 'riot', 'ranked_stats', rankedStats, new Date()),
    DataPoint.insert(userId, 'riot', 'match_history', matchHistory, new Date()),
    DataPoint.insert(userId, 'riot', 'stats', stats, new Date()),
  ]);

  return { summoner, rankedStats, matchHistory, stats };
};

module.exports = { fetchAll, fetchSummoner, fetchRankedStats, fetchMatchHistory };
