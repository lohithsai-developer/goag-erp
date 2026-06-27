// backend/src/controllers/orderController.js
const { db } = require('../config/firebase');

const COLLECTION = 'orders';

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION).get();
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection(COLLECTION).doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: { id: doc.id, ...doc.data() }
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create order
exports.createOrder = async (req, res) => {
    try {
        const data = req.body;
        const id = data.id || data.order_number || `ORD-${Date.now().toString().slice(-8)}`;

        const orderData = {
            ...data,
            id: id,
            order_number: data.order_number || id,
            created_at: data.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await db.collection(COLLECTION).doc(id).set(orderData);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { id, ...orderData }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update order
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        delete data.id;
        delete data.order_number;

        await db.collection(COLLECTION).doc(id).update({
            ...data,
            updated_at: new Date().toISOString()
        });

        const updated = await db.collection(COLLECTION).doc(id).get();

        res.json({
            success: true,
            message: 'Order updated successfully',
            data: { id, ...updated.data() }
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ FIX: Update order status (PATCH endpoint)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const currentData = doc.data();
        const history = currentData.tracking?.history || [];
        history.push({
            status: status,
            date: new Date().toISOString(),
            message: `Order status updated to ${status}`
        });

        await db.collection(COLLECTION).doc(id).update({
            status: status,
            tracking: {
                status: status,
                lastUpdated: new Date().toISOString(),
                history: history
            },
            updated_at: new Date().toISOString()
        });

        const updated = await db.collection(COLLECTION).doc(id).get();

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            data: { id, ...updated.data() }
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await db.collection(COLLECTION).doc(id).delete();

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};