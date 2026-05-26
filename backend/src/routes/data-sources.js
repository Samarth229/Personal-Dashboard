const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const DataSource = require('../models/DataSource');
const syncEngine = require('../services/syncEngine');
const AppError = require('../utils/errorHandler');

// GET /api/data-sources
router.get('/', authenticate, async (req, res, next) => {
  try {
    const sources = await DataSource.findByUser(req.user.id);
    res.json({ success: true, sources });
  } catch (err) { next(err); }
});

// PATCH /api/data-sources/:source_name
router.patch('/:source_name', authenticate, async (req, res, next) => {
  try {
    const { source_name } = req.params;
    const { is_enabled } = req.body;
    await DataSource.setEnabled(req.user.id, source_name, is_enabled);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST /api/data-sources/:source_name/sync
router.post('/:source_name/sync', authenticate, async (req, res, next) => {
  try {
    const { source_name } = req.params;
    await syncEngine.syncSource(req.user.id, source_name);
    res.json({ success: true, message: `${source_name} sync triggered` });
  } catch (err) { next(err); }
});

module.exports = router;
