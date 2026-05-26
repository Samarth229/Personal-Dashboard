const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const insightEngine = require('../services/insightEngine');

// GET /api/insights
router.get('/', authenticate, async (req, res, next) => {
  try {
    const insights = await insightEngine.getInsights(req.user.id);
    res.json({ success: true, insights });
  } catch (err) { next(err); }
});

// POST /api/insights/generate
router.post('/generate', authenticate, async (req, res, next) => {
  try {
    const insights = await insightEngine.generateAndSave(req.user.id);
    res.json({ success: true, insights });
  } catch (err) { next(err); }
});

// PATCH /api/insights/:id/read
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    await insightEngine.markRead(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
