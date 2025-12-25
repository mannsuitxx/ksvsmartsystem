const mongoose = require('mongoose');

const interventionSchema = mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['Meeting', 'Call', 'Email', 'Other', 'Nudge'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'In Progress'],
    default: 'Open',
  },
  remarks: {
    type: String,
    required: true,
  },
  actionPlan: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

const Intervention = mongoose.model('Intervention', interventionSchema);

module.exports = Intervention;
