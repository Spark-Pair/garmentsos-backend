const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleStats
} = require('../controllers/articleController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Validation rules
const articleValidation = [
    body('article_no')
        .trim()
        .notEmpty().withMessage('Article number is required'),
    body('season')
        .notEmpty().withMessage('Season is required')
        .isIn([
            'Spring 2024', 'Summer 2024', 'Fall 2024', 'Winter 2024',
            'Spring 2025', 'Summer 2025', 'Fall 2025', 'Winter 2025'
        ]).withMessage('Invalid season'),
    body('size')
        .trim()
        .notEmpty().withMessage('Size is required'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['Men', 'Women', 'Kids', 'Unisex']).withMessage('Invalid category'),
    body('fabric_type')
        .notEmpty().withMessage('Fabric type is required')
        .isIn(['Woven', 'Knitted', 'Non-Woven', 'Blended']).withMessage('Invalid fabric type'),
    body('sales_rate')
        .notEmpty().withMessage('Sales rate is required')
        .isNumeric().withMessage('Sales rate must be a number')
        .custom((value) => value >= 0).withMessage('Sales rate must be positive'),
    body('rates')
        .optional()
        .isArray().withMessage('Rates must be an array'),
    body('rates.*.category')
        .optional()
        .isIn(['fabric', 'work', 'accessory', 'labor']).withMessage('Invalid rate category'),
    body('rates.*.title')
        .optional()
        .trim()
        .notEmpty().withMessage('Rate title is required'),
    body('rates.*.price')
        .optional()
        .isNumeric().withMessage('Rate price must be a number')
];

const updateArticleValidation = [
    body('article_no').optional().trim().notEmpty().withMessage('Article number cannot be empty'),
    body('season')
        .optional()
        .isIn([
            'Spring 2024', 'Summer 2024', 'Fall 2024', 'Winter 2024',
            'Spring 2025', 'Summer 2025', 'Fall 2025', 'Winter 2025'
        ]).withMessage('Invalid season'),
    body('size').optional().trim().notEmpty().withMessage('Size cannot be empty'),
    body('category')
        .optional()
        .isIn(['Men', 'Women', 'Kids', 'Unisex']).withMessage('Invalid category'),
    body('fabric_type')
        .optional()
        .isIn(['Woven', 'Knitted', 'Non-Woven', 'Blended']).withMessage('Invalid fabric type'),
    body('sales_rate')
        .optional()
        .isNumeric().withMessage('Sales rate must be a number'),
    body('rates')
        .optional()
        .isArray().withMessage('Rates must be an array')
];

// Apply protection to all routes
router.use(protect);

// Stats route (must be before :id route)
router.get('/stats', getArticleStats);

// Routes
router.route('/')
    .get(getArticles)
    .post(
        upload.single('image'), // Pehle image parse hogi
        articleValidation,      // Phir data validate hoga
        createArticle           // Phir save hoga
    );

router.route('/:id')
    .get(getArticle)
    .put(updateArticleValidation, upload.single('image'), updateArticle)
    .delete(deleteArticle);

module.exports = router;
