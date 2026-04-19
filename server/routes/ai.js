const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getRecipe, extractFromImage } = require('../controllers/recipeController');

// Use memory storage — image is held in buffer, not saved to disk
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/ai/recipe — text prompt → recipe
router.post('/recipe', getRecipe);

// POST /api/ai/extract — image upload → matched products
router.post('/extract', upload.single('image'), extractFromImage);

module.exports = router;
