const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const droneController = require('../controllers/droneController');

// All routes require authentication
router.use(authMiddleware);

router.get('/', droneController.getDrones);
router.get('/:id', droneController.getDroneById);
router.post('/', authorize('admin', 'production'), droneController.createDrone);
router.put('/:id', authorize('admin', 'production'), droneController.updateDrone);
router.delete('/:id', authorize('admin'), droneController.deleteDrone);

module.exports = router;