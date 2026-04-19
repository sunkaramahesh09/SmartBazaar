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
// API contract (confirmed via Postman):
//   field "file"    → the uploaded image file
//   field "request" → JSON string: { "available_products": [...] }
// Response: { "matched_products": [{ original_text, matched_product_name, confidence }] }
const extractFromImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No image uploaded' });

    const available_products = await getAvailableProducts();

    const form = new FormData();

    // ✅ Correct field name: "file" (not "image")
    form.append('file', req.file.buffer, {
      filename: req.file.originalname || 'upload.jpg',
      contentType: req.file.mimetype || 'image/jpeg',
      knownLength: req.file.buffer.length,
    });

    // ✅ Correct field name: "request" containing one JSON string with available_products
    form.append('request', JSON.stringify({ available_products }));

    console.log('📸 Sending to AI extract API:', {
      filename: req.file.originalname,
      size: req.file.buffer.length,
      productsCount: available_products.length,
    });

    const aiRes = await axios.post(
      `${AI_BASE_URL}/extract`,
      form,
      {
        headers: { ...form.getHeaders() },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const raw = aiRes.data;
    console.log('✅ AI extract response:', JSON.stringify(raw).slice(0, 400));

    // Response shape: { matched_products: [{ original_text, matched_product_name, confidence }] }
    const matched = Array.isArray(raw?.matched_products) ? raw.matched_products : [];

    if (matched.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Map each matched product back to our real DB product (for price, _id, images etc.)
    const enriched = matched
      .map(m => {
        // matched_product_name may be like "Potato (kg)" — find the closest product
        const matchedName = (m.matched_product_name || m.original_text || '').toLowerCase();
        const dbProduct = available_products.find(p =>
          matchedName.includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(matchedName.split(' ')[0])
        );

        if (!dbProduct) return null;

        return {
          _id: dbProduct.id,
          id: dbProduct.id,
          name: dbProduct.name,
          price: dbProduct.price,
          unit: dbProduct.unit,
          stock: dbProduct.quantity,
          images: [],
          confidence: m.confidence,
          original_text: m.original_text,
        };
      })
      .filter(Boolean); // remove nulls (unmatched items)

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
