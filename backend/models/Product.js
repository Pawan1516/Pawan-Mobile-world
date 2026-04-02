const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    default: '📦'
  },
  category: {
    type: String,
    enum: [
      'Mobiles',
      'Screen Protection',
      'Cases & Covers',
      'Cables & Chargers',
      'Audio',
      'Power',
      'Accessories',
      'Other'
    ],
    required: true
  },
  mobileType: {
    type: String,
    enum: ['Android', 'iPhone', 'Feature Phone', 'Tablet', 'Other Mobile', ''],
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  costPrice: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  minStockAlert: {
    type: Number,
    default: 5
  },
  supplier: {
    type: String
  },
  sku: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  description: {
    type: String
  },
  warranty: {
    type: String,
    default: 'No Warranty'
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
