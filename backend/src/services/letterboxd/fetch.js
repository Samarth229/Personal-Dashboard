const axios = require('axios');
const DataPoint = require('../../models/DataPoint');

// Letterboxd exposes public RSS feeds — no API key required
const LETTERBOXD_RSS = (username) => `https://letterboxd.com/${username}/rss/`;

const parseRSS = (xml) => {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag) => {
      const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>|<${tag}[^>]*>([^<]*)<\/${tag}>`);
      const match = r.exec(block);
      return match ? (match[1] || match[2] || '').trim() : '';
    };
    const rating = (() => {
      const r = /<letterboxd:memberRating>([^<]+)<\/letterboxd:memberRating>/.exec(block);
      return r ? parseFloat(r[1]) : null;
    })();
    const watchedDate = (() => {
      const r = /<letterboxd:watchedDate>([^<]+)<\/letterboxd:watchedDate>/.exec(block);
      return r ? r[1] : null;
    })();
    const filmTitle = (() => {
      const r = /<letterboxd:filmTitle>([^<]+)<\/letterboxd:filmTitle>/.exec(block);
      return r ? r[1] : get('title').replace(/ \(\d{4}\).*$/, '');
    })();
    const filmYear = (() => {
      const r = /<letterboxd:filmYear>([^<]+)<\/letterboxd:filmYear>/.exec(block);
      return r ? r[1] : null;
    })();
    const link = get('link');
    if (filmTitle) items.push({ title: filmTitle, year: filmYear, rating, watchedDate, link });
  }
  return items;
};

const fetchRecentFilms = async (username) => {
  const { data: xml } = await axios.get(LETTERBOXD_RSS(username), { timeout: 10000 });
  return parseRSS(xml).slice(0, 20);
};

const fetchAll = async (userId, username) => {
  if (!username) throw new Error('Letterboxd username not configured');
  const recentFilms = await fetchRecentFilms(username);

  const ratingDist = {};
  recentFilms.forEach(({ rating }) => {
    if (rating) {
      const key = String(rating);
      ratingDist[key] = (ratingDist[key] || 0) + 1;
    }
  });

  const avg = recentFilms.filter((f) => f.rating).reduce((s, f) => s + f.rating, 0) /
    (recentFilms.filter((f) => f.rating).length || 1);

  const stats = {
    recentCount: recentFilms.length,
    averageRating: Math.round(avg * 10) / 10,
    ratingDistribution: ratingDist,
  };

  await Promise.all([
    DataPoint.insert(userId, 'letterboxd', 'recent_films', recentFilms, new Date()),
    DataPoint.insert(userId, 'letterboxd', 'stats', stats, new Date()),
  ]);

  return { recentFilms, stats };
};

module.exports = { fetchAll, fetchRecentFilms };
