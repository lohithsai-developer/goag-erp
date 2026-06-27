// backend/src/routes/quotationRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    getAllQuotations,
    getQuotationById,
    createQuotation,
    updateQuotation,
    updateQuotationStatus,
    deleteQuotation,
    convertToOrder
} = require('../controllers/quotationController');

// Get all quotations
router.get('/', authMiddleware, getAllQuotations);

// Get quotation by ID
router.get('/:id', authMiddleware, getQuotationById);

// Create quotation
router.post('/', authMiddleware, createQuotation);

// Update quotation
router.put('/:id', authMiddleware, updateQuotation);

// ✅ FIX: Update quotation status (PATCH endpoint)
router.patch('/:id/status', authMiddleware, updateQuotationStatus);

// Convert to order
router.post('/:id/convert', authMiddleware, convertToOrder);

// Delete quotation
router.delete('/:id', authMiddleware, deleteQuotation);

module.exports = router;