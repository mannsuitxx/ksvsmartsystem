const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['exam_paper', 'notes', 'syllabus'],
    default: 'exam_paper',
  },
  subject: {
    type: String, // Or Ref to Subject model if strict strictness needed, but String is more flexible for "Old" papers
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  year: {
    type: String, // e.g. "2023", "2022-23"
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
