const mongoose = require('mongoose');

const systemConfigSchema = mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // e.g., 'attendance_threshold', 'detention_rules'
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can be number, string, object
    required: true,
  },
  description: {
    type: String,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
});

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

module.exports = SystemConfig;
