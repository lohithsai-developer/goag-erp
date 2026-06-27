// backend/src/routes/tempCustomerRoutes.js
const express = require('express');
const router = express.Router();
const TempCustomer = require('../models/TempCustomer');
const { authMiddleware } = require('../middleware/auth');

// Get all temp customers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const customers = await TempCustomer.findAll();
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get temp customer by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await TempCustomer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Temp customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create temp customer
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Email is optional - only validate phone and name
    if (!req.body.name || !req.body.phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and phone are required' 
      });
    }
    
    const customer = await TempCustomer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update temp customer
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await TempCustomer.update(req.params.id, req.body);
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete temp customer
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await TempCustomer.delete(req.params.id);
    res.json({ success: true, message: 'Temp customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Convert to actual customer
router.post('/:id/convert', authMiddleware, async (req, res) => {
  try {
    const customer = await TempCustomer.convertToCustomer(req.params.id, req.body);
    res.json({ success: true, message: 'Customer converted successfully', data: customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
