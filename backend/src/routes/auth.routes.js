const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Protected routes
router.get('/me', auth, authController.getMe);
router.patch('/me', auth, authController.updateProfile);

// Admin routes
router.get('/users', auth, authorize('admin'), authController.getAllUsers);
router.patch('/users/:id/role', auth, authorize('admin'), authController.updateUserRole);

module.exports = router;
