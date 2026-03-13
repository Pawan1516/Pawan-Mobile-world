const express = require('express');
const router = express.Router();
const {
  getBills,
  getBillById,
  createBill,
  exportCSV
} = require('../controllers/billController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getBills);
router.get('/export/csv', protect, adminOnly, exportCSV);
router.get('/:id', protect, getBillById);
router.post('/', protect, createBill);

module.exports = router;
