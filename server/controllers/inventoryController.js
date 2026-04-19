const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const { sendLowStockAlert } = require('../utils/mailer');

// @route  GET /api/inventory
exports.getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find()
      .populate('product', 'name images price unit')
      .sort('-updatedAt');
    res.json({ success: true, data: inventory });
  } catch (err) { next(err); }
};

// @route  PUT /api/inventory/:productId
exports.updateInventory = async (req, res, next) => {
  try {
    const { currentStock, threshold } = req.body;
    let inv = await Inventory.findOne({ product: req.params.productId });

    if (!inv) {
      inv = new Inventory({ product: req.params.productId, currentStock, threshold });
    } else {
      if (currentStock !== undefined) inv.currentStock = currentStock;
      if (threshold !== undefined) inv.threshold = threshold;
    }

    // Sync product stock
    await Product.findByIdAndUpdate(req.params.productId, {
      stock: inv.currentStock,
      threshold: inv.threshold
    });

    // Low stock check
    if (inv.currentStock <= inv.threshold && !inv.alertSent) {
      const product = await Product.findById(req.params.productId);
      await sendLowStockAlert(product, inv.currentStock, inv.threshold);
      inv.alertSent = true;
    } else if (inv.currentStock > inv.threshold) {
      inv.alertSent = false;
    }

    inv.lastRestocked = new Date();
    await inv.save();

    res.json({ success: true, data: inv });
  } catch (err) { next(err); }
};
