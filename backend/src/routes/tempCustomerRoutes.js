// backend/src/routes/tempCustomerRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    getAllTempCustomers,
    getTempCustomerById,
    createTempCustomer,
    updateTempCustomer,
    deleteTempCustomer,
    convertToCustomer
} = require('../controllers/tempCustomerController');

// Get all temp customers
router.get('/', authMiddleware, getAllTempCustomers);

// Get temp customer by ID
router.get('/:id', authMiddleware, getTempCustomerById);

// Create temp customer
router.post('/', authMiddleware, createTempCustomer);

// Update temp customer
router.put('/:id', authMiddleware, updateTempCustomer);

// Delete temp customer
router.delete('/:id', authMiddleware, deleteTempCustomer);

// Convert to actual customer
router.post('/:id/convert', authMiddleware, convertToCustomer);

module.exports = router;
