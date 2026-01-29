const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, getMe, updateProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation rules
const loginValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .toLowerCase(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

const profileValidation = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Name cannot be empty'),
    body('password')
        .optional()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Routes
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, profileValidation, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;