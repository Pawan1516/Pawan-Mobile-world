const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleStatus,
  adjustStock,
  deleteProduct,
  bulkUploadProducts
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/bulk', protect, adminOnly, upload.single('file'), bulkUploadProducts);
router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.put('/:id/toggle', protect, adminOnly, toggleStatus);
router.put('/:id/stock', protect, adminOnly, adjustStock);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
