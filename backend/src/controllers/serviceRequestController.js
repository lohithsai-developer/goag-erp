const ServiceRequestFirebase = require('../models/ServiceRequestFirebase');
const logger = require('../utils/logger');

const getServiceRequests = async (req, res) => {
    try {
        const data = await ServiceRequestFirebase.findAll();
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Get service requests error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getServiceRequestById = async (req, res) => {
    try {
        const data = await ServiceRequestFirebase.findById(req.params.id);
        if (!data) {
            return res.status(404).json({ success: false, message: 'Service request not found' });
        }
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Get service request error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createServiceRequest = async (req, res) => {
    try {
        const data = await ServiceRequestFirebase.create(req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        logger.error('Create service request error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateServiceRequest = async (req, res) => {
    try {
        const data = await ServiceRequestFirebase.update(req.params.id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Update service request error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteServiceRequest = async (req, res) => {
    try {
        await ServiceRequestFirebase.delete(req.params.id);
        res.json({ success: true, message: 'Service request deleted successfully' });
    } catch (error) {
        logger.error('Delete service request error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateServiceRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const data = await ServiceRequestFirebase.updateStatus(req.params.id, status);
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Update service request status error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getServiceRequests,
    getServiceRequestById,
    createServiceRequest,
    updateServiceRequest,
    deleteServiceRequest,
    updateServiceRequestStatus
};