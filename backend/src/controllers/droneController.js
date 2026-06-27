const DroneFirebase = require('../models/DroneFirebase');
const logger = require('../utils/logger');

const getDrones = async (req, res) => {
    try {
        const drones = await DroneFirebase.findAll();
        res.json({ success: true, data: drones });
    } catch (error) {
        logger.error('Get drones error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDroneById = async (req, res) => {
    try {
        const drone = await DroneFirebase.findById(req.params.id);
        if (!drone) {
            return res.status(404).json({ success: false, message: 'Drone not found' });
        }
        res.json({ success: true, data: drone });
    } catch (error) {
        logger.error('Get drone error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createDrone = async (req, res) => {
    try {
        const drone = await DroneFirebase.create(req.body);
        res.status(201).json({ success: true, data: drone });
    } catch (error) {
        logger.error('Create drone error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateDrone = async (req, res) => {
    try {
        const drone = await DroneFirebase.update(req.params.id, req.body);
        res.json({ success: true, data: drone });
    } catch (error) {
        logger.error('Update drone error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteDrone = async (req, res) => {
    try {
        await DroneFirebase.delete(req.params.id);
        res.json({ success: true, message: 'Drone deleted successfully' });
    } catch (error) {
        logger.error('Delete drone error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDrones,
    getDroneById,
    createDrone,
    updateDrone,
    deleteDrone
};