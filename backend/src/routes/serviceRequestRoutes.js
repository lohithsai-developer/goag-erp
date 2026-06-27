const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const serviceRequestController = require('../controllers/serviceRequestController');

// All routes require authentication
router.use(authMiddleware);

// Make sure all controller functions exist
router.get('/', serviceRequestController.getServiceRequests);
router.get('/:id', serviceRequestController.getServiceRequestById);
router.post('/', authorize('admin', 'aftersales'), serviceRequestController.createServiceRequest);
router.put('/:id', authorize('admin', 'aftersales'), serviceRequestController.updateServiceRequest);
router.delete('/:id', authorize('admin'), serviceRequestController.deleteServiceRequest);
router.patch('/:id/status', authorize('admin', 'aftersales'), serviceRequestController.updateServiceRequestStatus);

module.exports = router;