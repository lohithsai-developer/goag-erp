// backend/src/controllers/customerController.js
const { db } = require('../config/firebase');

const COLLECTION = 'customers';

// Get all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION).get();
        const customers = [];
        snapshot.forEach(doc => {
            customers.push({ id: doc.id, ...doc.data() });
        });
        res.json({
            success: true,
            data: customers
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection(COLLECTION).doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: { id: doc.id, ...doc.data() }
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create customer
exports.createCustomer = async (req, res) => {
    try {
        const data = req.body;
        const id = data.id || `CUST-${String(Date.now()).slice(-4)}`;

        const customerData = {
            ...data,
            id: id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            total_orders: 0,
            total_spent: 0
        };

        await db.collection(COLLECTION).doc(id).set(customerData);

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: { id, ...customerData }
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update customer
exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        delete data.id;

        await db.collection(COLLECTION).doc(id).update({
            ...data,
            updated_at: new Date().toISOString()
        });

        const updated = await db.collection(COLLECTION).doc(id).get();

        res.json({
            success: true,
            message: 'Customer updated successfully',
            data: { id, ...updated.data() }
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        await db.collection(COLLECTION).doc(id).delete();

        res.json({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get customer with orders
exports.getCustomerWithOrders = async (req, res) => {
    try {
        const { id } = req.params;

        const customerDoc = await db.collection(COLLECTION).doc(id).get();
        if (!customerDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const ordersSnapshot = await db.collection('orders')
            .where('customer_id', '==', id)
            .get();

        const orders = [];
        ordersSnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        res.json({
            success: true,
            data: {
                customer: { id: customerDoc.id, ...customerDoc.data() },
                orders: orders
            }
        });
    } catch (error) {
        console.error('Error fetching customer with orders:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get customer orders
exports.getCustomerOrders = async (req, res) => {
    try {
        const { id } = req.params;

        const customerDoc = await db.collection(COLLECTION).doc(id).get();
        if (!customerDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const ordersSnapshot = await db.collection('orders')
            .where('customer_id', '==', id)
            .get();

        const orders = [];
        ordersSnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        res.json({
            success: true,
            data: {
                customer: {
                    id: customerDoc.id,
                    name: customerDoc.data().name,
                    email: customerDoc.data().email,
                    phone: customerDoc.data().phone
                },
                orders: orders
            }
        });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update order stats
exports.updateOrderStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderAmount } = req.body;

        if (!orderAmount || orderAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid order amount is required'
            });
        }

        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const data = doc.data();
        await db.collection(COLLECTION).doc(id).update({
            total_orders: (data.total_orders || 0) + 1,
            total_spent: (data.total_spent || 0) + orderAmount,
            last_order_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        const updated = await db.collection(COLLECTION).doc(id).get();

        res.json({
            success: true,
            message: 'Customer stats updated successfully',
            data: { id, ...updated.data() }
        });
    } catch (error) {
        console.error('Error updating customer stats:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};