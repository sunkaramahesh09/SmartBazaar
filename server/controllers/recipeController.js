const axios = require('axios');
const FormData = require('form-data');
const Product = require('../models/Product');

const AI_BASE_URL = 'https://recipifyai.up.railway.app/api/recipe';

// Helper: fetch all active products and format for the AI API
const getAvailableProducts = async () => {
  const products = await Product.find({ isActive: true }).select('name price unit stock _id');
  return products.map(p => ({
    id: p._id.toString(),
    name: p.name,
    price: p.price,
    unit: p.unit || 'piece',
    quantity: p.stock,
  }));
};

// POST /api/ai/recipe — text-based recipe suggestion
const getRecipe = async (req, res) => {
  try {
    const { user_request } = req.body;
    if (!user_request) return res.status(400).json({ success: false, message: 'user_request is required' });

    const available_products = await getAvailableProducts();

    const { data } = await axios.post(
      AI_BASE_URL,
      { user_request, available_products },
      { timeout: 15000, headers: { 'Content-Type': 'application/json' } }
    );

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Recipe AI error:', err.message);
    // Signal frontend to fall back to product search
    return res.json({ success: false, fallback: true, message: 'AI unavailable, falling back to search' });
  }
};

// POST /api/ai/extract — image-based ingredient detection
const extractFromImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    const available_products = await getAvailableProducts();

    // Build multipart form to forward to friend's API
    const form = new FormData();
    form.append('image', req.file.buffer, {
      filename: req.file.originalname || 'upload.jpg',
      contentType: req.file.mimetype,
    });
    form.append('available_products', JSON.stringify(available_products));
    form.append('user_request', 'Extract ingredients from image');

    const { data } = await axios.post(
      `${AI_BASE_URL}/extract`,
      form,
      {
        headers: { ...form.getHeaders() },
        timeout: 20000,
      }
    );

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Image extract AI error:', err.message);
    return res.status(500).json({ success: false, message: 'Image analysis failed. Please try again.' });
  }
};

module.exports = { getRecipe, extractFromImage };
