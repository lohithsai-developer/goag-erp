const TaskFirebase = require('../models/TaskFirebase');
const logger = require('../utils/logger');

const getTasks = async (req, res) => {
    try {
        const data = await TaskFirebase.findAll();
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Get tasks error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const data = await TaskFirebase.findById(req.params.id);
        if (!data) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Get task error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        const data = await TaskFirebase.create(req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        logger.error('Create task error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const data = await TaskFirebase.update(req.params.id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Update task error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        await TaskFirebase.delete(req.params.id);
        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        logger.error('Delete task error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const data = await TaskFirebase.updateStatus(req.params.id, status);
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Update task status error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus
};