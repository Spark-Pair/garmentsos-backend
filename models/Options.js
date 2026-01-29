const mongoose = require('mongoose');

const OptionsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    enum: ['seasons', 'sizes', 'categories', 'rateCategories']
  },
  values: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Options', OptionsSchema);
