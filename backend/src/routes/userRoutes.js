const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Import the controller
const userController = require('../controllers/userController');

// Debug: Log what we have
console.log('userController:', Object.keys(userController));

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(authorize('admin'));

// Routes
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validate(schemas.updateUser), userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/toggle-access', userController.toggleUserAccess);

module.exports = router;