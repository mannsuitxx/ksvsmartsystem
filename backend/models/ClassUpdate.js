const mongoose = require('mongoose');

const classUpdateSchema = mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String, // Or Subject ID
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['conducted', 'cancelled'],
    default: 'conducted',
  },
  remarks: {
    type: String, // Reason for cancellation etc.
  }
}, {
  timestamps: true,
});

const ClassUpdate = mongoose.model('ClassUpdate', classUpdateSchema);

module.exports = ClassUpdate;
