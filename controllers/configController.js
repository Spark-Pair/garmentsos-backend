const appConfig = require('../app.config.json');

// @desc    Get app configuration
// @route   GET /api/config
// @access  Private
exports.getConfig = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        app: appConfig.app,
        company: appConfig.company,
        developer: appConfig.developer,
        license: {
          expiry: appConfig.license.expiry
        }
      }
    });
  } catch (error) {
    console.error('Get Config Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration'
    });
  }
};