const firebaseService = require('../services/firebase.service');

const COLLECTION = 'tasks';

class TaskFirebase {
    static async create(data) {
        try {
            data.createdAt = new Date().toISOString();
            data.updatedAt = new Date().toISOString();
            data.status = data.status || 'pending';
            data.priority = data.priority || 'medium';

            const result = await firebaseService.create(COLLECTION, data);
            return result;
        } catch (error) {
            throw new Error(`Error creating task: ${error.message}`);
        }
    }

    static async findAll() {
        try {
            const data = await firebaseService.getAll(COLLECTION, 'createdAt', 'desc');
            return data;
        } catch (error) {
            throw new Error(`Error fetching tasks: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const data = await firebaseService.getById(COLLECTION, id);
            return data;
        } catch (error) {
            throw new Error(`Error finding task: ${error.message}`);
        }
    }

    static async update(id, updateData) {
        try {
            updateData.updatedAt = new Date().toISOString();
            const result = await firebaseService.update(COLLECTION, id, updateData);
            return result;
        } catch (error) {
            throw new Error(`Error updating task: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const result = await firebaseService.delete(COLLECTION, id);
            return result;
        } catch (error) {
            throw new Error(`Error deleting task: ${error.message}`);
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
            throw new Error(`Error updating task status: ${error.message}`);
        }
    }

    static async findByAssignee(assignedTo) {
        try {
            const data = await firebaseService.getWhere(COLLECTION, { assignedTo });
            return data;
        } catch (error) {
            throw new Error(`Error finding tasks by assignee: ${error.message}`);
        }
    }

    static async findByStatus(status) {
        try {
            const data = await firebaseService.getWhere(COLLECTION, { status });
            return data;
        } catch (error) {
            throw new Error(`Error finding tasks by status: ${error.message}`);
        }
    }
}

module.exports = TaskFirebase;