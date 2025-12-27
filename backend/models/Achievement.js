const mongoose = require('mongoose');

const achievementSchema = mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  certificateUrl: {
    type: String, // URL/Path to the uploaded file
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Faculty/Mentor/Admin
  },
  remarks: {
    type: String,
  }
}, {
  timestamps: true,
});

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
