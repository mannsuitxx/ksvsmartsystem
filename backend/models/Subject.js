const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['Theory', 'Practical', 'Project'],
    default: 'Theory'
  }
}, {
  timestamps: true,
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
