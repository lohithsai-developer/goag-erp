const firebaseService = require('../services/firebase.service');

const COLLECTION = 'drones';

class DroneFirebase {
    static async create(droneData) {
        try {
            droneData.createdAt = new Date().toISOString();
            droneData.updatedAt = new Date().toISOString();
            droneData.status = droneData.status || 'available';

            // Use serial number as document ID
            const docId = droneData.serialNumber;
            const result = await firebaseService.create(COLLECTION, droneData, docId);
            return result;
        } catch (error) {
            throw new Error(`Error creating drone: ${error.message}`);
        }
    }

    static async findAll() {
        try {
            const drones = await firebaseService.getAll(COLLECTION, 'createdAt', 'desc');
            return drones;
        } catch (error) {
            throw new Error(`Error fetching drones: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const drone = await firebaseService.getById(COLLECTION, id);
            return drone;
        } catch (error) {
            throw new Error(`Error finding drone: ${error.message}`);
        }
    }

    static async update(id, updateData) {
        try {
            updateData.updatedAt = new Date().toISOString();
            const result = await firebaseService.update(COLLECTION, id, updateData);
            return result;
        } catch (error) {
            throw new Error(`Error updating drone: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const result = await firebaseService.delete(COLLECTION, id);
            return result;
        } catch (error) {
            throw new Error(`Error deleting drone: ${error.message}`);
        }
    }

    static async findByStatus(status) {
        try {
            const drones = await firebaseService.getWhere(COLLECTION, { status });
            return drones;
        } catch (error) {
            throw new Error(`Error finding drones by status: ${error.message}`);
        }
    }
}

module.exports = DroneFirebase;