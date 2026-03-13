const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNo: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    qty: Number,
    price: Number,
    total: Number,
    warranty: String
  }],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  gstPercent: {
    type: Number,
    default: 0
  },
  gstAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'UPI', 'GPay', 'Card', 'Pending'],
    required: true
  },
  notes: {
    type: String
  },
  pdfTheme: {
    type: String,
    default: 'blue'
  },
  sentOnWhatsApp: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
