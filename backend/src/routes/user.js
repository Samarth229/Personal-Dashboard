const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const AppError = require('../utils/errorHandler');

// GET /api/user/profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

// PUT /api/user/profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { first_name, last_name } = req.body;
    const user = await User.update(req.user.id, { first_name, last_name });
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

module.exports = router;
