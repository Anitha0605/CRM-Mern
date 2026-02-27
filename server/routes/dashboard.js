const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboardController');
const router = express.Router();

// PROTECTED ROUTES - JWT REQUIRED
router.get('/dashboard', authMiddleware, getDashboard);

// Additional protected routes
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
exports = router;