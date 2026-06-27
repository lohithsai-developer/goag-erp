// backend/src/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    getAllCustomers,
    getCustomerById,
    getCustomerWithOrders,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateOrderStats,
    getCustomerOrders
} = require('../controllers/customerController');

// Get all customers
router.get('/', authMiddleware, getAllCustomers);

// Get customer by ID
router.get('/:id', authMiddleware, getCustomerById);

// ✅ NEW: Create customer
router.post('/', authMiddleware, createCustomer);

// Get customer with orders
router.get('/:id/with-orders', authMiddleware, getCustomerWithOrders);

// Get customer orders
router.get('/:id/orders', authMiddleware, getCustomerOrders);

// Update customer
router.put('/:id', authMiddleware, updateCustomer);

// Delete customer
router.delete('/:id', authMiddleware, deleteCustomer);

// Update order stats
router.post('/:id/update-stats', authMiddleware, updateOrderStats);

module.exports = router;