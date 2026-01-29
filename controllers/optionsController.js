const OptionsQuery = require('../db/options.query');

// @desc    Get all options
// @route   GET /api/options
// @access  Public (or Private - your choice)
exports.getAllOptions = async (req, res) => {
  try {
    const options = OptionsQuery.getAll();

    // If no options exist, return default structure
    if (Object.keys(options).length === 0) {
      return res.json({
        success: true,
        data: {
          seasons: [],
          sizes: [],
          categories: [],
          rateCategories: {
            fabric: [],
            work: [],
            accessory: [],
            labor: []
          }
        }
      });
    }

    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Get Options Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Handle dynamic option updates
// @route   POST /api/options/:type/:category?
// @access  Private/Developer
exports.handleOptionUpdate = async (req, res) => {
  try {
    const { type, category } = req.params;
    const { value, index, action } = req.body;

    // Validate type
    const validTypes = ['seasons', 'sizes', 'categories', 'rateCategories'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Validate action
    const validActions = ['add', 'update', 'delete'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: `Invalid action. Must be one of: ${validActions.join(', ')}`
      });
    }

    // Get current options
    let options = OptionsQuery.findByKey(type);

    if (!options) {
      // Initialize based on type
      if (type === 'rateCategories') {
        options = { fabric: [], work: [], accessory: [], labor: [] };
      } else {
        options = [];
      }
    }

    let target;
    if (type === 'rateCategories') {
      // Validate category for rateCategories
      const validCategories = ['fabric', 'work', 'accessory', 'labor'];
      if (!category || !validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }

      if (!options[category]) {
        options[category] = [];
      }
      target = options[category];
    } else {
      target = options;
    }

    // Perform action
    if (action === 'add') {
      if (!value || value.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Value is required for add action'
        });
      }

      if (target.includes(value)) {
        return res.status(400).json({
          success: false,
          message: 'Item already exists'
        });
      }
      target.push(value);
    } 
    else if (action === 'update') {
      if (index === null || index === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Index is required for update action'
        });
      }

      if (!value || value.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Value is required for update action'
        });
      }

      if (index < 0 || index >= target.length) {
        return res.status(400).json({
          success: false,
          message: 'Invalid index'
        });
      }
      target[index] = value;
    } 
    else if (action === 'delete') {
      if (index === null || index === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Index is required for delete action'
        });
      }

      if (index < 0 || index >= target.length) {
        return res.status(400).json({
          success: false,
          message: 'Invalid index'
        });
      }
      target.splice(index, 1);
    }

    // Save updated options
    const updated = OptionsQuery.upsert(type, options);

    res.json({
      success: true,
      message: `Option ${action}ed successfully`,
      data: updated
    });
  } catch (error) {
    console.error('Update Option Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};