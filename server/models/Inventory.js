const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0
  },
  threshold: {
    type: Number,
    required: true,
    default: 10
  },
  lastRestocked: {
    type: Date,
    default: null
  },
  alertSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
