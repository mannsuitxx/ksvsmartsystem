const mongoose = require('mongoose');

const internalMarksSchema = mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectName: { type: String, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }, // Optional
  semester: { type: Number, required: true },
  examType: { type: String, enum: ['Mid-Sem', 'Quiz', 'Assignment'], required: true },
  marksObtained: { type: Number, required: true },
  maxMarks: { type: Number, required: true }
}, { timestamps: true });

const InternalMarks = mongoose.model('InternalMarks', internalMarksSchema);
module.exports = InternalMarks;
