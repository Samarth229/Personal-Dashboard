const axios = require('axios');
const { getValidToken } = require('./auth');
const DataPoint = require('../../models/DataPoint');

const spotifyApi = async (userId, path) => {
  const token = await getValidToken(userId);
  const { data } = await axios.get(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const fetchTopArtists = async (userId, timeRange = 'medium_term') => {
  const data = await spotifyApi(userId, `/me/top/artists?limit=10&time_range=${timeRange}`);
  await DataPoint.insert(userId, 'spotify', 'top_artists', data.items, new Date());
  return data.items;
};

const fetchTopTracks = async (userId, timeRange = 'medium_term') => {
  const data = await spotifyApi(userId, `/me/top/tracks?limit=10&time_range=${timeRange}`);
  await DataPoint.insert(userId, 'spotify', 'top_tracks', data.items, new Date());
  return data.items;
};

const fetchRecentlyPlayed = async (userId) => {
  const data = await spotifyApi(userId, '/me/player/recently-played?limit=20');
  await DataPoint.insert(userId, 'spotify', 'recently_played', data.items, new Date());
  return data.items;
};

const fetchAll = async (userId) => {
  const [topArtists, topTracks, recentlyPlayed] = await Promise.all([
    fetchTopArtists(userId),
    fetchTopTracks(userId),
    fetchRecentlyPlayed(userId),
  ]);
  return { topArtists, topTracks, recentlyPlayed };
};

module.exports = { fetchTopArtists, fetchTopTracks, fetchRecentlyPlayed, fetchAll };
