const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true
  },
  uniqueId: {
    type: String,
    unique: true,
    trim: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  phone: { type: String, default: '' },
  timings: {
    open: { type: String, default: '08:00 AM' },
    close: { type: String, default: '09:00 PM' }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Auto-generate uniqueId
storeSchema.pre('save', function (next) {
  if (!this.uniqueId) {
    this.uniqueId = 'VB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Store', storeSchema);
