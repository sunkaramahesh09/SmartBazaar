const Store = require('../models/Store');

// @route  GET /api/stores
exports.getStores = async (req, res, next) => {
  try {
    const stores = await Store.find({ isActive: true }).sort('name');
    res.json({ success: true, data: stores });
  } catch (err) { next(err); }
};

// @route  GET /api/stores/:id
exports.getStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, data: store });
  } catch (err) { next(err); }
};

// @route  POST /api/stores  (admin)
exports.createStore = async (req, res, next) => {
  try {
    const store = await Store.create(req.body);
    res.status(201).json({ success: true, data: store });
  } catch (err) { next(err); }
};

// @route  PUT /api/stores/:id  (admin)
exports.updateStore = async (req, res, next) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, data: store });
  } catch (err) { next(err); }
};

// @route  DELETE /api/stores/:id  (admin)
exports.deleteStore = async (req, res, next) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, message: 'Store removed' });
  } catch (err) { next(err); }
};
