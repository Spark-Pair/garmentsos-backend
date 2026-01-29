const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { protect, isDeveloper } = require('../middleware/auth');

// Validation rules
const createUserValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['developer', 'user']).withMessage('Invalid role')
];

const updateUserValidation = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('password')
        .optional()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['developer', 'user']).withMessage('Invalid role')
];

// Apply protection to all routes
router.use(protect);
router.use(isDeveloper);

// Routes
router.route('/')
    .get(getUsers)
    .post(createUserValidation, createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUserValidation, updateUser)
    .delete(deleteUser);

module.exports = router;
