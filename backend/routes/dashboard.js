const express = require('express');
const router = express.Router();
const {
  getStats,
  getCategoryStock,
  getRecentBills
} = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, getStats);
router.get('/category-stock', protect, adminOnly, getCategoryStock);
router.get('/recent-bills', protect, adminOnly, getRecentBills);

module.exports = router;
