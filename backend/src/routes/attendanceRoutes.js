const express = require('express');
const router = express.Router();

// Sample tasks
const productionTasks = [
    { id: 1, task_name: 'Assemble Drone Frame', status: 'pending', deadline: '2026-04-20', order_number: 'ORD-001' },
    { id: 2, task_name: 'Install Flight Controller', status: 'in_progress', deadline: '2026-04-18', order_number: 'ORD-001' },
    { id: 3, task_name: 'Battery Testing', status: 'completed', deadline: '2026-04-15', order_number: 'ORD-002' }
];

const serviceTasks = [
    { id: 1, issue_type: 'Motor Repair', status: 'pending', deadline: '2026-04-19', request_number: 'SRV-001' },
    { id: 2, issue_type: 'Battery Replacement', status: 'in_progress', deadline: '2026-04-17', request_number: 'SRV-002' }
];

// Get production tasks
router.get('/production-tasks', (req, res) => {
    res.json({ success: true, tasks: productionTasks });
});

// Get service tasks
router.get('/service-tasks', (req, res) => {
    res.json({ success: true, tasks: serviceTasks });
});

// Update production task status
router.put('/production/:taskId/status', (req, res) => {
    const { taskId } = req.params;
    const { status, remarks } = req.body;
    res.json({ success: true, message: `Task ${taskId} updated to ${status}` });
});

// Update service task status
router.put('/service/:taskId/status', (req, res) => {
    const { taskId } = req.params;
    const { status, remarks } = req.body;
    res.json({ success: true, message: `Task ${taskId} updated to ${status}` });
});

module.exports = router;