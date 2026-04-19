const express = require('express');
const router = express.Router();
const { getInventory, updateInventory } = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getInventory);
router.put('/:productId', protect, adminOnly, updateInventory);

module.exports = router;
