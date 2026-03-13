const Product = require('../models/Product');
const xlsx = require('xlsx');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  const { status, category, search } = req.query;
  let query = {};

  if (status && status !== 'All') query.status = status;
  if (category && category !== 'All') query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { supplier: { $regex: search, $options: 'i' } }
    ];
  }

  const products = await Product.find(query).sort({ name: 1 });
  res.json(products);
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const {
    name, emoji, category, price, costPrice,
    stock, minStockAlert, supplier, sku, description
  } = req.body;

  const product = await Product.create({
    name, emoji, category, price, costPrice,
    stock, minStockAlert, supplier, sku, description
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400).json({ message: 'Invalid product data' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = req.body.name || product.name;
    product.emoji = req.body.emoji || product.emoji;
    product.category = req.body.category || product.category;
    product.price = req.body.price || product.price;
    product.costPrice = req.body.costPrice || product.costPrice;
    product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
    product.minStockAlert = req.body.minStockAlert || product.minStockAlert;
    product.supplier = req.body.supplier || product.supplier;
    product.sku = req.body.sku || product.sku;
    product.description = req.body.description || product.description;
    product.status = req.body.status || product.status;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Toggle product status
// @route   PUT /api/products/:id/toggle
// @access  Private/Admin
const toggleStatus = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.status = product.status === 'active' ? 'inactive' : 'active';
    await product.save();
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Adjust stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
const adjustStock = async (req, res) => {
  const { amount } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.stock += amount;
    await product.save();
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Bulk upload products from Excel
// @route   POST /api/products/bulk
// @access  Private/Admin
const bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No Excel file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'The uploaded Excel file is empty' });
    }

    const operations = data.map(row => {
      const p = {
        name: row['Name'] || row['name'] || 'Unnamed Product',
        emoji: row['Emoji'] || row['emoji'] || '📦',
        category: row['Category'] || row['category'] || 'Accessories',
        price: Number(row['Selling Price'] || row['price'] || row['SellingPrice']) || 0,
        costPrice: Number(row['Cost Price'] || row['costPrice'] || row['CostPrice']) || 0,
        stock: Number(row['Stock'] || row['stock']) || 0,
        minStockAlert: Number(row['Min Stock'] || row['minStockAlert'] || row['MinStock']) || 5,
        supplier: row['Supplier'] || row['supplier'] || '',
        description: row['Description'] || row['description'] || '',
        status: row['Status'] || row['status'] || 'active',
        warranty: row['Warranty'] || row['warranty'] || 'No Warranty',
      };
      
      const sku = row['SKU'] || row['sku'];
      if (sku) p.sku = sku;

      const filter = p.sku ? { sku: p.sku } : { name: p.name };

      return {
        updateOne: {
          filter,
          update: { $set: p },
          upsert: true
        }
      };
    });

    await Product.bulkWrite(operations);

    res.status(201).json({ message: `Successfully uploaded and merged ${data.length} products` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process bulk upload', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleStatus,
  adjustStock,
  deleteProduct,
  bulkUploadProducts
};
