const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Yahan check karein ke path bilkul sahi ho
const { getAllOptions, handleOptionUpdate } = require('../controllers/optionsController');

// Routes
router.get('/', getAllOptions); // Error yahan tha, kyunki getAllOptions undefined tha

router.use(protect);

router.post('/:type', handleOptionUpdate);
router.post('/:type/:category', handleOptionUpdate);

module.exports = router;