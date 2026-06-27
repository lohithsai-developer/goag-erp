const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const authController = require('../controllers/authFirebaseController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, validate(schemas.changePassword), authController.changePassword);

module.exports = router;