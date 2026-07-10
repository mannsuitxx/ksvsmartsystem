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

    // 3. Semester Comparison (Total student counts)
    const studentsBySem = await Student.aggregate([
        { $group: { _id: "$currentSemester", count: { $sum: 1 } } }
    ]);

    // 3b. Risk Distribution Across Semesters (Grouped counts)
    const riskBySemesterRaw = await Student.aggregate([
        {
            $group: {
                _id: { semester: "$currentSemester", risk: "$riskProfile.level" },
                count: { $sum: 1 }
            }
        }
    ]);
    
    // Format risk distribution per semester
    const riskBySemester = {};
    riskBySemesterRaw.forEach(item => {
        const sem = `Sem ${item._id.semester}`;
        let risk = item._id.risk || 'Safe';
        if (risk === 'Moderate Risk') risk = 'Moderate';
        if (risk === 'High Risk' || risk === 'Critical') risk = 'Critical';
        
        if (!riskBySemester[sem]) {
            riskBySemester[sem] = { Safe: 0, Moderate: 0, Critical: 0 };
        }
        riskBySemester[sem][risk] = (riskBySemester[sem][risk] || 0) + item.count;
    });

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

    // 6. Assessment Difficulty Analyzer Results
    const assessmentAnalysis = {};
    allMarks.forEach(m => {
        const key = `${m.subjectName} - ${m.examType}`;
        if (!assessmentAnalysis[key]) {
            assessmentAnalysis[key] = { 
                subject: m.subjectName,
                exam: m.examType,
                totalStudents: 0, 
                passedCount: 0, 
                totalMarksObtained: 0,
                maxMarks: m.maxMarks,
            };
        }
        const entry = assessmentAnalysis[key];
        entry.totalStudents++;
        entry.totalMarksObtained += m.marksObtained;
        if ((m.marksObtained / m.maxMarks) >= 0.4) {
            entry.passedCount++;
        }
    });

    const assessmentDifficulty = Object.values(assessmentAnalysis).map(a => {
        const avg = a.totalMarksObtained / a.totalStudents;
        const passRate = (a.passedCount / a.totalStudents) * 100;
        let status = 'Balanced';
        if (passRate < 50) status = 'Too Hard / Poor Performance';
        if (passRate > 95) status = 'Too Easy / Grade Inflation';

        return {
            subject: a.subject,
            exam: a.exam,
            totalStudents: a.totalStudents,
            passedCount: a.passedCount,
            maxMarks: a.maxMarks,
            averageScore: avg.toFixed(1),
            passRate: passRate.toFixed(1),
            status
        };
    });

    // 7. Intervention Effectiveness Metrics
    const allInterventions = await Intervention.find({}).populate('studentId');
    let totalInterventions = allInterventions.length;
    let successInterventions = 0;
    let totalInterventionsEvaluated = 0;
    const typeCounts = { Meeting: 0, Call: 0, Email: 0, Nudge: 0, Other: 0 };
    
    allInterventions.forEach(i => {
        if (typeCounts[i.type] !== undefined) {
            typeCounts[i.type]++;
        } else {
            typeCounts['Other']++;
        }
        if (i.studentId) {
            const level = i.studentId.riskProfile ? i.studentId.riskProfile.level : 'Safe';
            if (level !== 'High Risk' && level !== 'Critical') {
                successInterventions++;
            }
            totalInterventionsEvaluated++;
        }
    });
    
    const interventionEffectiveness = {
        successRate: totalInterventionsEvaluated === 0 ? 100 : ((successInterventions / totalInterventionsEvaluated) * 100).toFixed(1),
        totalCount: totalInterventions,
        typeCounts,
        recent: allInterventions.slice(0, 10).map(i => ({
            date: i.date,
            studentName: i.studentId ? (i.studentId.firstName + ' ' + i.studentId.lastName) : 'Unknown',
            type: i.type,
            status: i.status,
            remarks: i.remarks
        }))
    };

    // 8. Faculty Compliance Stats
    const totalFacultyUsers = await User.countDocuments({ role: 'faculty' });
    const activeFacultyAttendance = await LectureAttendance.distinct('facultyId');
    const compliantFacultyCount = activeFacultyAttendance.length;
    const complianceRate = totalFacultyUsers === 0 ? 100 : ((compliantFacultyCount / totalFacultyUsers) * 100).toFixed(1);
    
    const facultyCompliance = {
        totalFaculty: totalFacultyUsers,
        activeFaculty: compliantFacultyCount,
        complianceRate,
        recentUploads: auditLogs.slice(0, 5)
    };

    res.json({
        failures: subjectFailureReport,
        facultyImpact,
        semesters: studentsBySem,
        riskBySemester,
        detention: detentionList,
        audit: auditLogs,
        assessmentDifficulty,
        interventionEffectiveness,
        facultyCompliance
    });
});

module.exports = { getAnalytics, getDeepAnalytics };