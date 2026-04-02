const express = require('express');
const router = express.Router();
const {
  getBills,
  getBillById,
  createBill,
  exportCSV
} = require('../controllers/billController');

router.get('/', getBills);
router.get('/export/csv', exportCSV);
router.get('/:id', getBillById);
router.post('/', createBill);

module.exports = router;
