const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings
} = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getSettings);
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;
