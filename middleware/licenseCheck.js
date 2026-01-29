const db = require('../db/database');

module.exports = (req, res, next) => {
  const config = db.prepare(
    'SELECT expiry_date FROM app_config LIMIT 1'
  ).get();

  if (!config) return next(); // first run

  const expiry = new Date(config.expiry_date);
  if (new Date() > expiry) {
    return res.status(403).json({
      success: false,
      message: 'Software license expired. Contact SparkPair.'
    });
  }

  next();
};
