const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

router.use(authMiddleware);

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', authorize('admin', 'production'), taskController.createTask);
router.put('/:id', authorize('admin', 'production'), taskController.updateTask);
router.delete('/:id', authorize('admin'), taskController.deleteTask);
router.patch('/:id/status', authorize('admin', 'production'), taskController.updateTaskStatus);

module.exports = router;