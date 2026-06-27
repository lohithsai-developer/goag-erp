const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const userController = require('../controllers/userFirebaseController');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(authorize('admin'));

// Routes
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', validate(schemas.register), userController.createUser);
router.put('/:id', validate(schemas.updateUser), userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/toggle-access', userController.toggleUserAccess);

module.exports = router;