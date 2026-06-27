// backend/src/controllers/quotationController.js
const { db } = require('../config/firebase');

const COLLECTION = 'quotations';

// Get all quotations
exports.getAllQuotations = async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION).get();
        const quotations = [];
        snapshot.forEach(doc => {
            quotations.push({ id: doc.id, ...doc.data() });
        });
        res.json({
            success: true,
            data: quotations
        });
    } catch (error) {
        console.error('Error fetching quotations:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get quotation by ID
exports.getQuotationById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection(COLLECTION).doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        res.json({
            success: true,
            data: { id: doc.id, ...doc.data() }
        });
    } catch (error) {
        console.error('Error fetching quotation:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create quotation
exports.createQuotation = async (req, res) => {
    try {
        const data = req.body;
        const id = data.id || `QTN-${Date.now().toString().slice(-10)}`;

        const quotationData = {
            ...data,
            id: id,
            createdDate: data.createdDate || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await db.collection(COLLECTION).doc(id).set(quotationData);

        res.status(201).json({
            success: true,
            message: 'Quotation created successfully',
            data: { id, ...quotationData }
        });
    } catch (error) {
        console.error('Error creating quotation:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update quotation
exports.updateQuotation = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Check if document exists
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        const data = req.body;
        delete data.id;

        await db.collection(COLLECTION).doc(id).update({
            ...data,
            updatedAt: new Date().toISOString()
        });

        const updated = await db.collection(COLLECTION).doc(id).get();

        res.json({
            success: true,
            message: 'Quotation updated successfully',
            data: { id, ...updated.data() }
        });
    } catch (error) {
        console.error('Error updating quotation:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ FIX: Update quotation status (PATCH endpoint)
exports.updateQuotationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        // ✅ Check if document exists
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        await db.collection(COLLECTION).doc(id).update({
            status: status,
            updatedAt: new Date().toISOString()
        });

        const updated = await db.collection(COLLECTION).doc(id).get();

        res.json({
            success: true,
            message: `Quotation status updated to ${status}`,
            data: { id, ...updated.data() }
        });
    } catch (error) {
        console.error('Error updating quotation status:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete quotation
exports.deleteQuotation = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        await db.collection(COLLECTION).doc(id).delete();

        res.json({
            success: true,
            message: 'Quotation deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting quotation:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Convert quotation to order
exports.convertToOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const orderData = req.body;

        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        // Update quotation status
        await db.collection(COLLECTION).doc(id).update({
            status: 'converted',
            convertedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Create order
        const orderId = orderData.order_number || `ORD-${Date.now().toString().slice(-8)}`;
        await db.collection('orders').doc(orderId).set({
            ...orderData,
            id: orderId,
            quotation_id: id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Quotation converted to order successfully',
            data: {
                quotationId: id,
                orderId: orderId
            }
        });
    } catch (error) {
        console.error('Error converting quotation to order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};