// backend/src/controllers/tempCustomerController.js
const TempCustomer = require('../models/TempCustomer');

// Get all temp customers
exports.getAllTempCustomers = async (req, res) => {
    try {
        const customers = await TempCustomer.findAll();
        res.json({
            success: true,
            data: customers
        });
    } catch (error) {
        console.error('Error fetching temp customers:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get temp customer by ID
exports.getTempCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await TempCustomer.findById(id);
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Temp customer not found'
            });
        }
        
        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        console.error('Error fetching temp customer:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create temp customer
exports.createTempCustomer = async (req, res) => {
    try {
        const { name, phone, email, address, city, state, gst } = req.body;
        
        // Validate required fields
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone are required'
            });
        }
        
        const customer = await TempCustomer.create({
            name,
            phone,
            email: email || '',
            address: address || '',
            city: city || '',
            state: state || '',
            gst: gst || ''
        });
        
        res.status(201).json({
            success: true,
            message: 'Temp customer created successfully',
            data: customer
        });
    } catch (error) {
        console.error('Error creating temp customer:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update temp customer
exports.updateTempCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const customer = await TempCustomer.update(id, updates);
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Temp customer not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Temp customer updated successfully',
            data: customer
        });
    } catch (error) {
        console.error('Error updating temp customer:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete temp customer
exports.deleteTempCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        
        const customer = await TempCustomer.findById(id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Temp customer not found'
            });
        }
        
        await TempCustomer.delete(id);
        
        res.json({
            success: true,
            message: 'Temp customer deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting temp customer:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Convert temp customer to actual customer
exports.convertToCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customerData = req.body;
        
        // Check if temp customer exists
        const tempCustomer = await TempCustomer.findById(id);
        if (!tempCustomer) {
            return res.status(404).json({
                success: false,
                message: 'Temp customer not found'
            });
        }
        
        // Check if already converted
        if (tempCustomer.status === 'converted') {
            return res.status(400).json({
                success: false,
                message: 'This temp customer has already been converted'
            });
        }
        
        const newCustomer = await TempCustomer.convertToCustomer(id, customerData);
        
        res.json({
            success: true,
            message: 'Customer converted successfully',
            data: newCustomer
        });
    } catch (error) {
        console.error('Error converting customer:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
