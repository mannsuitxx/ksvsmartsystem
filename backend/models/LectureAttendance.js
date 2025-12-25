const mongoose = require('mongoose');

const lectureAttendanceSchema = mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }, // Optional for prototype
  subjectName: { type: String, required: true }, // Denormalized for prototype speed
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  batch: { type: String },
  topic: { type: String },
  records: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    status: { type: String, enum: ['P', 'A', 'L'], required: true }
  }]
}, { timestamps: true });

const LectureAttendance = mongoose.model('LectureAttendance', lectureAttendanceSchema);
module.exports = LectureAttendance;
