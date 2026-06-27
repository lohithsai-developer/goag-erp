const firebaseService = require('../services/firebase.service');

const COLLECTION = 'orders';

class OrderFirebase {
    static async create(orderData) {
        try {
            orderData.createdAt = new Date().toISOString();
            orderData.updatedAt = new Date().toISOString();
            orderData.status = orderData.status || 'pending';

            const result = await firebaseService.create(COLLECTION, orderData);
            return result;
        } catch (error) {
            throw new Error(`Error creating order: ${error.message}`);
        }
    }

    static async findAll() {
        try {
            const orders = await firebaseService.getAll(COLLECTION, 'createdAt', 'desc');
            return orders;
        } catch (error) {
            throw new Error(`Error fetching orders: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const order = await firebaseService.getById(COLLECTION, id);
            return order;
        } catch (error) {
            throw new Error(`Error finding order: ${error.message}`);
        }
    }

    static async update(id, updateData) {
        try {
            updateData.updatedAt = new Date().toISOString();
            const result = await firebaseService.update(COLLECTION, id, updateData);
            return result;
        } catch (error) {
            throw new Error(`Error updating order: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const result = await firebaseService.delete(COLLECTION, id);
            return result;
        } catch (error) {
            throw new Error(`Error deleting order: ${error.message}`);
        }
    }

    static async findByCustomer(customerId) {
        try {
            const orders = await firebaseService.getWhere(COLLECTION, { customerId });
            return orders;
        } catch (error) {
            throw new Error(`Error finding orders by customer: ${error.message}`);
        }
    }

    static async updateStatus(id, status) {
        try {
            const result = await firebaseService.update(COLLECTION, id, {
                status,
                updatedAt: new Date().toISOString()
            });
            return result;
        } catch (error) {
            throw new Error(`Error updating order status: ${error.message}`);
        }
    }
}

module.exports = OrderFirebase;