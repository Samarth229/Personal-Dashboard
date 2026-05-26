const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');
const { authenticate } = require('./middleware/auth');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', apiLimiter);

// Routes
app.use('/api/config', require('./routes/config'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/data-sources', require('./routes/data-sources'));
app.use('/api/spotify', require('./routes/spotify'));
app.use('/api/github', require('./routes/github'));
app.use('/api/gmail', require('./routes/gmail'));
app.use('/api/fitness', require('./routes/fitness'));
app.use('/api/letterboxd', require('./routes/letterboxd'));
app.use('/api/steam', require('./routes/steam'));
app.use('/api/riot', require('./routes/riot'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/settings', require('./routes/settings'));

// Dashboard overview
app.get('/api/dashboard/overview', authenticate, async (req, res, next) => {
  try {
    const DataPoint = require('./models/DataPoint');
    const DataSource = require('./models/DataSource');

    const [sources, spotifyArtists, spotifyTracks, githubProfile, githubContrib, gmailStats, fitnessSteps, fitnessSleep] = await Promise.all([
      DataSource.findByUser(req.user.id),
      DataPoint.getLatest(req.user.id, 'spotify', 'top_artists'),
      DataPoint.getLatest(req.user.id, 'spotify', 'top_tracks'),
      DataPoint.getLatest(req.user.id, 'github', 'profile'),
      DataPoint.getLatest(req.user.id, 'github', 'contributions'),
      DataPoint.getLatest(req.user.id, 'gmail', 'stats'),
      DataPoint.getLatest(req.user.id, 'fitness', 'steps'),
      DataPoint.getLatest(req.user.id, 'fitness', 'sleep'),
    ]);

    const lastSync = sources.reduce((latest, s) => {
      if (!s.last_sync) return latest;
      return !latest || new Date(s.last_sync) > new Date(latest) ? s.last_sync : latest;
    }, null);

    res.json({
      success: true,
      data: {
        spotify: { topArtists: spotifyArtists[0]?.value, topTracks: spotifyTracks[0]?.value },
        github: { profile: githubProfile[0]?.value, contributions: githubContrib[0]?.value },
        gmail: { stats: gmailStats[0]?.value },
        fitness: { steps: fitnessSteps[0]?.value, sleep: fitnessSleep[0]?.value },
        sources,
        lastSync,
      },
    });
  } catch (err) { next(err); }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'sqlite' }));

app.use(errorHandler);

module.exports = app;
