const express = require('express');
const router = express.Router();
const { getStores, getStore, createStore, updateStore, deleteStore } = require('../controllers/storeController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getStores);
router.get('/:id', getStore);
router.post('/', protect, adminOnly, createStore);
router.put('/:id', protect, adminOnly, updateStore);
router.delete('/:id', protect, adminOnly, deleteStore);

module.exports = router;
