const express = require('express');
const router = express.Router();
const { RATE_CATEGORIES, SEASONS, CATEGORIES, FABRIC_TYPES } = require('../config/constants');

// @desc    Get app configuration
// @route   GET /api/config
// @access  Public
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            appName: process.env.APP_NAME,
            companyName: process.env.COMPANY_NAME,
            companyAddress: process.env.COMPANY_ADDRESS,
            companyPhone: process.env.COMPANY_PHONE,
            companyEmail: process.env.COMPANY_EMAIL,
            subscriptionExpiry: process.env.SUBSCRIPTION_EXPIRY,
            poweredBy: process.env.POWERED_BY
        }
    });
});

// @desc    Get rate categories
// @route   GET /api/config/rate-categories
// @access  Public
router.get('/rate-categories', (req, res) => {
    res.status(200).json({
        success: true,
        data: RATE_CATEGORIES
    });
});

// @desc    Get all dropdown options
// @route   GET /api/config/options
// @access  Public
router.get('/options', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            rateCategories: RATE_CATEGORIES,
            seasons: SEASONS,
            categories: CATEGORIES,
            fabric_types: FABRIC_TYPES
        }
    });
});

module.exports = router;
