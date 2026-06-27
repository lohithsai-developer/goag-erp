// backend/src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');

// Get all orders
router.get('/', authMiddleware, getAllOrders);

// Get order by ID
router.get('/:id', authMiddleware, getOrderById);

// Create order
router.post('/', authMiddleware, createOrder);

// Update order
router.put('/:id', authMiddleware, updateOrder);

// ✅ FIX: Update order status (PATCH endpoint)
router.patch('/:id/status', authMiddleware, updateOrderStatus);

// Delete order
router.delete('/:id', authMiddleware, deleteOrder);

module.exports = router;