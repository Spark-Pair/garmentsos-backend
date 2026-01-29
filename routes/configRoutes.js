const express = require('express');
const router = express.Router();
const { getConfig } = require('../controllers/configController');

// @desc    Get app configuration
// @route   GET /api/config
// @access  Public
router.get('/', getConfig);

module.exports = router;