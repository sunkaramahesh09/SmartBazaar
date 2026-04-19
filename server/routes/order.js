const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// ⚠️ Admin routes MUST come before /:id to avoid Express matching "admin" as an id
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.put('/admin/:id/status', protect, adminOnly, updateOrderStatus);

// User routes
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrder); // keep last — catches any id string

module.exports = router;
