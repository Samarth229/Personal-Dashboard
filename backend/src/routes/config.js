const express = require('express');
const router = express.Router();
const env = require('../config/env');
const { authenticate } = require('../middleware/auth');

// GET /api/config/status — tells frontend which services have API keys set
router.get('/status', authenticate, (req, res) => {
  res.json({ success: true, configured: env.isConfigured });
});

module.exports = router;
