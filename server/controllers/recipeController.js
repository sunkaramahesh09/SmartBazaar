const axios = require('axios');
const FormData = require('form-data');
const Product = require('../models/Product');

const AI_BASE_URL = 'https://recipifyai.up.railway.app/api/recipe';

// Helper: fetch all active products formatted for the AI API
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
    if (!user_request)
      return res.status(400).json({ success: false, message: 'user_request is required' });

    const available_products = await getAvailableProducts();

    const { data } = await axios.post(
      AI_BASE_URL,
      { user_request, available_products },
      { timeout: 15000, headers: { 'Content-Type': 'application/json' } }
    );

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Recipe AI error:', err.message);
    return res.json({ success: false, fallback: true, message: 'AI unavailable, falling back to search' });
  }
};

// POST /api/ai/extract — forward image to recipifyai and return matched products
const extractFromImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No image uploaded' });

    const available_products = await getAvailableProducts();

    // Build multipart/form-data exactly as the external API expects:
    //   field "image"              → the uploaded file buffer
    //   field "available_products" → JSON string of products array
    //   field "user_request"       → plain text string
    const form = new FormData();

    form.append('image', req.file.buffer, {
      filename: req.file.originalname || 'upload.jpg',
      contentType: req.file.mimetype || 'image/jpeg',
      knownLength: req.file.buffer.length,   // ← required so form-data sets Content-Length correctly
    });

    form.append('available_products', JSON.stringify(available_products));
    form.append('user_request', 'Extract ingredients from image');

    console.log('📸 Sending to AI extract API:', {
      filename: req.file.originalname,
      size: req.file.buffer.length,
      mimeType: req.file.mimetype,
      productsCount: available_products.length,
    });

    const aiRes = await axios.post(
      `${AI_BASE_URL}/extract`,
      form,
      {
        headers: { ...form.getHeaders() },
        timeout: 30000,            // vision models can be slow
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const raw = aiRes.data;
    console.log('✅ AI extract raw response:', JSON.stringify(raw).slice(0, 400));

    // Handle whatever shape the API returns
    let matched = [];
    if (Array.isArray(raw))                      matched = raw;
    else if (Array.isArray(raw?.products))       matched = raw.products;
    else if (Array.isArray(raw?.data))           matched = raw.data;
    else if (Array.isArray(raw?.matched_products)) matched = raw.matched_products;
    else if (Array.isArray(raw?.ingredients))    matched = raw.ingredients;
    else if (Array.isArray(raw?.results))        matched = raw.results;

    // Attach _id from our DB so the cart "Add" button works
    const enriched = matched.map(p => {
      const local = available_products.find(
        a => a.id === (p.id || p._id) || a.name.toLowerCase() === p.name?.toLowerCase()
      );
      return {
        ...p,
        _id: local?.id || p.id || p._id,
        id:  local?.id || p.id || p._id,
        images: [],
      };
    });

    return res.json({ success: true, data: enriched });
  } catch (err) {
    const extStatus = err.response?.status;
    const extBody   = err.response?.data;
    console.error('❌ AI extract error:', {
      message: err.message,
      externalStatus: extStatus,
      externalBody: JSON.stringify(extBody)?.slice(0, 500),
    });
    return res.status(500).json({
      success: false,
      message: 'Image analysis failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { debug: { extStatus, extBody } }),
    });
  }
};

module.exports = { getRecipe, extractFromImage };
