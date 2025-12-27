const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  currentSemester: {
    type: Number,
    required: true,
  },
  division: {
    type: String,
    required: true,
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to a Faculty user
  },
  parentEmail: {
    type: String,
    required: false, // Optional for now, can be updated later
  },
  profilePicture: {
    type: String, // Path to image
    default: null
  },
  riskProfile: {
    score: { type: Number, default: 0 },
    level: { type: String, enum: ['Safe', 'Moderate', 'Critical'], default: 'Safe' },
    reasons: [String],
  }
}, {
  timestamps: true,
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
