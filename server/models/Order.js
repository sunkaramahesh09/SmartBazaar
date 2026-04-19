const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  token: {
    type: Number,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed'],
    default: 'pending'
  },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Generate unique 4-digit pickup token
orderSchema.pre('save', async function (next) {
  if (!this.token) {
    let token;
    let exists = true;
    while (exists) {
      token = Math.floor(1000 + Math.random() * 9000);
      exists = await mongoose.model('Order').findOne({ token });
    }
    this.token = token;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
