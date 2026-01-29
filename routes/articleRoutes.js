const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleStats,
    getBulkArticles
} = require('../controllers/articleController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Validation rules
const articleValidation = [
    body('article_no')
        .trim()
        .notEmpty().withMessage('Article number is required')
        .toUpperCase(), // Auto uppercase
    body('season')
        .notEmpty().withMessage('Season is required'),
    body('size')
        .trim()
        .notEmpty().withMessage('Size is required'),
    body('category')
        .notEmpty().withMessage('Category is required'),
    body('fabric_type')
        .notEmpty().withMessage('Fabric type is required'),
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 0 }).withMessage('Quantity must be a positive number'),
    body('sales_rate')
        .notEmpty().withMessage('Sales rate is required')
        .isNumeric().withMessage('Sales rate must be a number')
        .custom((value) => value >= 0).withMessage('Sales rate must be positive'),
    body('rates')
        .optional()
        .custom((value) => {
            // Accept both string (JSON) and array
            if (typeof value === 'string') {
                try {
                    JSON.parse(value);
                    return true;
                } catch (e) {
                    throw new Error('Invalid rates format');
                }
            }
            return Array.isArray(value);
        }).withMessage('Rates must be an array or valid JSON'),
    body('description')
        .optional()
        .trim()
];

const updateArticleValidation = [
    body('article_no')
        .optional()
        .trim()
        .notEmpty().withMessage('Article number cannot be empty')
        .toUpperCase(),
    body('season')
        .optional()
        .notEmpty().withMessage('Season cannot be empty'),
    body('size')
        .optional()
        .trim()
        .notEmpty().withMessage('Size cannot be empty'),
    body('category')
        .optional()
        .notEmpty().withMessage('Category cannot be empty'),
    body('fabric_type')
        .optional()
        .notEmpty().withMessage('Fabric type cannot be empty'),
    body('quantity')
        .optional()
        .isInt({ min: 0 }).withMessage('Quantity must be positive'),
    body('sales_rate')
        .optional()
        .isNumeric().withMessage('Sales rate must be a number')
        .custom((value) => value >= 0).withMessage('Sales rate must be positive'),
    body('rates')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                try {
                    JSON.parse(value);
                    return true;
                } catch (e) {
                    throw new Error('Invalid rates format');
                }
            }
            return Array.isArray(value);
        })
];

// Apply protection to all routes
router.use(protect);

// Stats route (must be before :id route)
router.get('/stats', getArticleStats);

// Bulk articles
router.post('/bulk', getBulkArticles);

// Routes
router.route('/')
    .get(getArticles)
    .post(upload.single('image'), articleValidation, createArticle);

router.route('/:id')
    .get(getArticle)
    .put(upload.single('image'), updateArticleValidation, updateArticle)
    .delete(deleteArticle);

module.exports = router;