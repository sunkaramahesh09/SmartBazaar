const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const { sendLowStockAlert } = require('../utils/mailer');

// @desc   Get all products with filters
// @route  GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, featured, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (featured === 'true') query.isFeatured = true;

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).populate('category', 'name slug').sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (err) { next(err); }
};

// @desc   Get single product
// @route  GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product || !product.isActive)
      return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

// @desc   Create product (admin)
// @route  POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const product = await Product.create({ ...req.body, images });
    await Inventory.create({ product: product._id, currentStock: product.stock, threshold: product.threshold });
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
};

// @desc   Update product (admin)
// @route  PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    let update = { ...req.body };
    if (req.files && req.files.length > 0) {
      update.images = req.files.map(f => `/uploads/${f.filename}`);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Sync inventory
    const inv = await Inventory.findOne({ product: product._id });
    if (inv) {
      inv.currentStock = product.stock;
      inv.threshold = product.threshold;
      // Check low stock
      if (product.stock <= product.threshold && !inv.alertSent) {
        await sendLowStockAlert(product, product.stock, product.threshold);
        inv.alertSent = true;
      } else if (product.stock > product.threshold) {
        inv.alertSent = false;
      }
      await inv.save();
    }
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

// @desc   Delete product (admin)
// @route  DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product removed' });
  } catch (err) { next(err); }
};
