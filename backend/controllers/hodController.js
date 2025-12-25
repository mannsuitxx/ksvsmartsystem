const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const User = require('../models/User');
const LectureAttendance = require('../models/LectureAttendance');
const InternalMarks = require('../models/InternalMarks');
const Intervention = require('../models/Intervention');

// @desc    Get Department Analytics (Enhanced)
// @route   GET /api/hod/analytics
// @access  Private (HOD)
const getAnalytics = asyncHandler(async (req, res) => {
  // 1. Total Students
  const totalStudents = await Student.countDocuments();

  // 2. Risk Distribution
  const criticalCount = await Student.countDocuments({ 'riskProfile.level': 'High Risk' });
  const moderateCount = await Student.countDocuments({ 'riskProfile.level': 'Moderate Risk' });

  // 3. Subject Performance (Simulated Aggregation)
  // In a real app, this would use complex MongoDB aggregations on Marks & Attendance collections
  // For prototype, we generate structured data based on the 'subjects' context
  const subjectPerformance = [
      { code: 'CE501', subject: 'Java Programming', enrolled: 60, passed: 51, passRate: 85, avgAttendance: 78 },
      { code: 'CE502', subject: 'Data Structures', enrolled: 60, passed: 37, passRate: 62, avgAttendance: 65 },
      { code: 'CE503', subject: 'Web Technologies', enrolled: 60, passed: 55, passRate: 92, avgAttendance: 88 },
      { code: 'CE504', subject: 'Database Management', enrolled: 60, passed: 48, passRate: 80, avgAttendance: 72 }
  ];

  res.json({
    totalStudents,
    riskStats: { critical: criticalCount, moderate: moderateCount },
    subjectPerformance
  });
});

// @desc    Get Deep Analytics for HOD Reports
// @route   GET /api/hod/deep-analytics
// @access  Private (HOD)
const getDeepAnalytics = asyncHandler(async (req, res) => {
    // 1. Subject Failure Analysis (Real Aggregation)
    const allMarks = await InternalMarks.find({});
    const failureStats = {};
    
    allMarks.forEach(m => {
        if (!failureStats[m.subjectName]) {
            failureStats[m.subjectName] = { total: 0, fail: 0, totalMarks: 0, studentIds: [] };
        }
        failureStats[m.subjectName].total++;
        failureStats[m.subjectName].totalMarks += m.marksObtained;
        failureStats[m.subjectName].studentIds.push(m.studentId); // For future attendance correlation
        
        const pct = (m.marksObtained / m.maxMarks) * 100;
        if (pct < 40) failureStats[m.subjectName].fail++;
    });

    const subjectFailureReport = Object.keys(failureStats).map(sub => ({
        subject: sub,
        failRate: ((failureStats[sub].fail / failureStats[sub].total) * 100).toFixed(1),
        avgScore: (failureStats[sub].totalMarks / failureStats[sub].total).toFixed(1),
        correlation: 'Analysis Pending' // Requires joining with attendance
    }));

    // 2. Faculty Impact Report
    // Aggregate Attendance by Faculty
    const facultyAttendance = await LectureAttendance.aggregate([
        { $group: { 
            _id: "$facultyId", 
            avgAttendance: { $avg: { $size: "$records" } }, // Simple count approximation
            subject: { $first: "$subjectName" }
        }}
    ]);
    
    // Resolve Faculty Names
    const facultyImpact = await Promise.all(facultyAttendance.map(async (f) => {
        const user = await User.findById(f._id);
        const marks = subjectFailureReport.find(s => s.subject === f.subject);
        return {
            name: user ? `${user.email}` : 'Unknown Faculty', // User model doesn't have name, using email
            subject: f.subject,
            avgAttendance: 45, // Placeholder for deep aggregation
            passRate: marks ? (100 - marks.failRate) : 'N/A'
        };
    }));

    // 3. Semester Comparison
    const studentsBySem = await Student.aggregate([
        { $group: { _id: "$currentSemester", count: { $sum: 1 } } }
    ]);

    // 4. Early Detention Prediction
    // Find students with attendance < 65% in ANY subject
    const detentionList = [];
    const allAttendance = await LectureAttendance.find({});
    const studentAttendanceMap = {}; // { studentId: { total: 0, present: 0 } }

    allAttendance.forEach(rec => {
        rec.records.forEach(r => {
            const sid = r.studentId.toString();
            if (!studentAttendanceMap[sid]) studentAttendanceMap[sid] = { total: 0, present: 0 };
            studentAttendanceMap[sid].total++;
            if (r.status === 'P') studentAttendanceMap[sid].present++;
        });
    });

    const studentDetails = await Student.find({}).select('firstName lastName enrollmentNumber');
    
    Object.keys(studentAttendanceMap).forEach(sid => {
        const stats = studentAttendanceMap[sid];
        const pct = (stats.present / stats.total) * 100;
        if (pct < 65) {
            const s = studentDetails.find(st => st._id.toString() === sid);
            if (s) {
                detentionList.push({
                    name: `${s.firstName} ${s.lastName}`,
                    enrollment: s.enrollmentNumber,
                    currentPct: pct.toFixed(1),
                    status: pct < 50 ? 'Critical' : 'Warning'
                });
            }
        }
    });

    // 5. Audit Logs
    const attendanceLogs = await LectureAttendance.find({}).sort({ createdAt: -1 }).limit(10).populate('facultyId', 'email');
    const marksLogs = await InternalMarks.find({}).sort({ createdAt: -1 }).limit(10);
    
    const auditLogs = [
        ...attendanceLogs.map(a => ({
            type: 'Attendance Upload',
            user: a.facultyId ? a.facultyId.email : 'Unknown',
            detail: `Uploaded for ${a.subjectName} (${a.records.length} students)`,
            date: a.createdAt
        })),
        ...marksLogs.map(m => ({
            type: 'Marks Entry',
            user: 'System/Faculty',
            detail: `Entry for ${m.subjectName} (${m.marksObtained}/${m.maxMarks})`,
            date: m.createdAt
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);

    res.json({
        failures: subjectFailureReport,
        facultyImpact,
        semesters: studentsBySem,
        detention: detentionList,
        audit: auditLogs
    });
});

module.exports = { getAnalytics, getDeepAnalytics };