const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  costPrice: {
    type: Number,
    default: 0
  },
  warranty: {
    type: String,
    default: 'No Warranty'
  },
  category: {
    type: String,
    default: 'Repair'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
