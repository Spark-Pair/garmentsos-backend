const express = require('express');
const router = express.Router();
const { protect, isDeveloper } = require('../middleware/auth');
const { getAllOptions, handleOptionUpdate } = require('../controllers/optionsController');

// Get all options (public or protected - your choice)
router.get('/', getAllOptions);

// Protected routes for updates
router.use(protect);
router.use(isDeveloper); // Only developers can update options

router.post('/:type', handleOptionUpdate);
router.post('/:type/:category', handleOptionUpdate);

module.exports = router;