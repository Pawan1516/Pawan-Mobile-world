const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  shopName: {
    type: String,
    default: 'Pavan Mobile World'
  },
  ownerName: {
    type: String
  },
  phone: {
    type: String
  },
  whatsapp: {
    type: String
  },
  address: {
    type: String
  },
  gstin: {
    type: String
  },
  pdfTheme: {
    type: String,
    default: 'blue'
  },
  billFooter: {
    type: String,
    default: 'Thank you for shopping with us!'
  },
  showGSTOnBill: {
    type: Boolean,
    default: true
  },
  autoStockDecrement: {
    type: Boolean,
    default: true
  },
  lowStockAlert: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
