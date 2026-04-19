const Order = require('../models/Order');
const Product = require('../models/Product');

// @route  POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, storeId, notes } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: 'No items in order' });

    // Validate and price items from DB
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive)
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      if (product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for: ${product.name}` });

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity
      });
      subtotal += product.price * item.quantity;

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      store: storeId,
      subtotal,
      total: subtotal,
      notes: notes || ''
    });

    await order.populate('store', 'name address');
    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
};

// @route  GET /api/orders/my  (user's own orders)
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('store', 'name address')
      .sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
};

// @route  GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('store', 'name address')
      .populate('user', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only admin or the order owner can view
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// @route  GET /api/admin/orders  (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('store', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (err) { next(err); }
};

// @route  PUT /api/admin/orders/:id/status  (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'completed'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('store', 'name address').populate('user', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};
