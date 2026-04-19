const Category = require('../models/Category');

// @route  GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

// @route  GET /api/categories/:id
exports.getCategory = async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
};

// @route  POST /api/categories  (admin)
exports.createCategory = async (req, res, next) => {
  try {
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const category = await Category.create({ ...req.body, image });
    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
};

// @route  PUT /api/categories/:id  (admin)
exports.updateCategory = async (req, res, next) => {
  try {
    let update = { ...req.body };
    if (req.file) update.image = `/uploads/${req.file.filename}`;
    const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) { next(err); }
};

// @route  DELETE /api/categories/:id  (admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category removed' });
  } catch (err) { next(err); }
};
