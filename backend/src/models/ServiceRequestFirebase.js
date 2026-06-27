const firebaseService = require('../services/firebase.service');

const COLLECTION = 'serviceRequests';

class ServiceRequestFirebase {
    static async create(data) {
        try {
            data.createdAt = new Date().toISOString();
            data.updatedAt = new Date().toISOString();
            data.status = data.status || 'pending';
            data.priority = data.priority || 'medium';
            data.requestNumber = data.requestNumber || `SR-${Date.now().toString().slice(-10)}`;

            const result = await firebaseService.create(COLLECTION, data);
            return result;
        } catch (error) {
            throw new Error(`Error creating service request: ${error.message}`);
        }
    }

    static async findAll() {
        try {
            const data = await firebaseService.getAll(COLLECTION, 'createdAt', 'desc');
            return data;
        } catch (error) {
            throw new Error(`Error fetching service requests: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const data = await firebaseService.getById(COLLECTION, id);
            return data;
        } catch (error) {
            throw new Error(`Error finding service request: ${error.message}`);
        }
    }

    static async update(id, updateData) {
        try {
            updateData.updatedAt = new Date().toISOString();
            const result = await firebaseService.update(COLLECTION, id, updateData);
            return result;
        } catch (error) {
            throw new Error(`Error updating service request: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const result = await firebaseService.delete(COLLECTION, id);
            return result;
        } catch (error) {
            throw new Error(`Error deleting service request: ${error.message}`);
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
            throw new Error(`Error updating service request status: ${error.message}`);
        }
    }

    static async findByCustomer(customerId) {
        try {
            const data = await firebaseService.getWhere(COLLECTION, { customerId });
            return data;
        } catch (error) {
            throw new Error(`Error finding service requests by customer: ${error.message}`);
        }
    }

    static async findByStatus(status) {
        try {
            const data = await firebaseService.getWhere(COLLECTION, { status });
            return data;
        } catch (error) {
            throw new Error(`Error finding service requests by status: ${error.message}`);
        }
    }
}

module.exports = ServiceRequestFirebase;