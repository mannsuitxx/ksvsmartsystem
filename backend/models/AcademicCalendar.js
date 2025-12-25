const mongoose = require('mongoose');

const academicCalendarSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Exam', 'Holiday', 'Event', 'Deadline', 'Other'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

const AcademicCalendar = mongoose.model('AcademicCalendar', academicCalendarSchema);

module.exports = AcademicCalendar;
