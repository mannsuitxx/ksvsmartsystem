const asyncHandler = require('express-async-handler');
const { Parser } = require('json2csv');
const Student = require('../models/Student');
const LectureAttendance = require('../models/LectureAttendance');

// @desc    Export Student Master Data
// @route   GET /api/export/students
// @access  Private (Admin)
const exportStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({}).populate('userId', 'email isActive');

  const fields = ['enrollmentNumber', 'firstName', 'lastName', 'userId.email', 'department', 'currentSemester', 'division', 'parentEmail'];
  const opts = { fields };
  
  try {
    const parser = new Parser(opts);
    const csv = parser.parse(students);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('students_master.csv');
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating CSV' });
  }
});

// @desc    Export Attendance Report
// @route   GET /api/export/attendance
// @access  Private (Admin)
const exportAttendance = asyncHandler(async (req, res) => {
  // We need to calculate attendance % for each student
  // This might be heavy. For "Real time working model", we can do a simplified version.
  // Or just export raw daily logs?
  // "Attendance Report" usually implies summary.
  
  const students = await Student.find({});
  const attendanceRecords = await LectureAttendance.find({});

  const report = students.map(student => {
    let total = 0;
    let present = 0;

    attendanceRecords.forEach(doc => {
        const record = doc.records.find(r => r.studentId.toString() === student._id.toString());
        if (record) {
            total++;
            if (record.status === 'P') present++;
        }
    });

    const percentage = total === 0 ? 0 : ((present / total) * 100).toFixed(2);

    return {
        enrollment: student.enrollmentNumber,
        name: `${student.firstName} ${student.lastName}`,
        department: student.department,
        semester: student.currentSemester,
        totalLectures: total,
        lecturesPresent: present,
        percentage: percentage + '%'
    };
  });

  const fields = ['enrollment', 'name', 'department', 'semester', 'totalLectures', 'lecturesPresent', 'percentage'];
  const opts = { fields };

  try {
    const parser = new Parser(opts);
    const csv = parser.parse(report);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_report.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Error generating CSV' });
  }
});

// @desc    Export Risk Report
// @route   GET /api/export/risk
// @access  Private (Admin)
const exportRisk = asyncHandler(async (req, res) => {
  const students = await Student.find({}).sort({ 'riskProfile.score': -1 });

  const report = students.map(s => ({
    enrollment: s.enrollmentNumber,
    name: `${s.firstName} ${s.lastName}`,
    riskLevel: s.riskProfile?.level || 'Safe',
    riskScore: s.riskProfile?.score || 0,
    reasons: s.riskProfile?.reasons ? s.riskProfile.reasons.join('; ') : ''
  }));

  const fields = ['enrollment', 'name', 'riskLevel', 'riskScore', 'reasons'];
  const opts = { fields };

  try {
    const parser = new Parser(opts);
    const csv = parser.parse(report);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('risk_report.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Error generating CSV' });
  }
});

module.exports = { exportStudents, exportAttendance, exportRisk };
