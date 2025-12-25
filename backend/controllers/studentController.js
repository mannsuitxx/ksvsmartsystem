const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const LectureAttendance = require('../models/LectureAttendance');
const InternalMarks = require('../models/InternalMarks');
const Intervention = require('../models/Intervention');

const getStudentDashboard = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) { res.status(404); throw new Error('Student profile not found'); }

  // 1. Calculate Attendance %
  const attendanceRecords = await LectureAttendance.find({ 'records.studentId': student._id });
  
  let totalLectures = 0;
  let presentCount = 0;
  const subjectAttendance = {};

  attendanceRecords.forEach(doc => {
    const record = doc.records.find(r => r.studentId.toString() === student._id.toString());
    if (record) {
      if (!subjectAttendance[doc.subjectName]) subjectAttendance[doc.subjectName] = { total: 0, present: 0 };
      subjectAttendance[doc.subjectName].total++;
      totalLectures++;
      if (record.status === 'P') {
        subjectAttendance[doc.subjectName].present++;
        presentCount++;
      }
    }
  });

  const overallAttendance = totalLectures === 0 ? 0 : ((presentCount / totalLectures) * 100);

  // 2. Fetch Marks & Check Low Marks
  const marks = await InternalMarks.find({ studentId: student._id });
  let lowMarksFlag = false;
  marks.forEach(m => {
    const percentage = (m.marksObtained / m.maxMarks) * 100;
    if (percentage < 40) lowMarksFlag = true;
  });

  // 3. Strict Risk Logic
  // Rule: IF attendance < 75 AND marks < 40 → HIGH RISK
  let riskLevel = 'Safe';
  let riskScore = 0;
  const factors = [];

  if (overallAttendance < 75) {
    factors.push('Low Attendance (<75%)');
    riskScore += 50;
  }
  if (lowMarksFlag) {
    factors.push('Low Marks (<40%)');
    riskScore += 30;
  }

  if (overallAttendance < 75 && lowMarksFlag) {
    riskLevel = 'High Risk';
    factors.push('CRITICAL: Low Attendance & Low Marks');
  } else if (overallAttendance < 75 || lowMarksFlag) {
    riskLevel = 'Moderate Risk';
  }

  res.json({
    profile: {
      name: `${student.firstName} ${student.lastName}`,
      enrollment: student.enrollmentNumber,
      semester: student.currentSemester,
      profilePicture: student.profilePicture
    },
    metrics: {
      attendance: {
        percentage: overallAttendance.toFixed(1),
        subjectWise: subjectAttendance
      },
      marks: marks,
      risk: {
        score: riskScore,
        level: riskLevel,
        factors: factors
      }
    }
  });
});

// @desc    Get Detailed Attendance for a Student (Drill-Down)
// @route   GET /api/student/attendance/:studentId
// @access  Private (Faculty/Mentor/Student)
const getStudentAttendanceDetails = asyncHandler(async (req, res) => {
  // If no studentId provided (e.g. student calling for themselves), use their ID
  // But this route is likely for Faculty/Mentor viewing a student, or Student viewing self.
  // For simplicity, we expect studentId as param, or derive from user if self.
  
  let targetStudentId = req.params.studentId;

  // If student is requesting their own data
  if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      targetStudentId = student._id;
  }

  const attendanceRecords = await LectureAttendance.find({ 'records.studentId': targetStudentId })
      .sort({ date: -1 });

  const history = attendanceRecords.map(doc => {
      const record = doc.records.find(r => r.studentId.toString() === targetStudentId.toString());
      return {
          date: doc.date,
          subject: doc.subjectName,
          status: record ? record.status : 'N/A' // Should exist if query matched
      };
  });

  // Calculate stats
  const stats = {};
  attendanceRecords.forEach(doc => {
      const record = doc.records.find(r => r.studentId.toString() === targetStudentId.toString());
      if (record) {
          if (!stats[doc.subjectName]) stats[doc.subjectName] = { total: 0, present: 0 };
          stats[doc.subjectName].total++;
          if (record.status === 'P') stats[doc.subjectName].present++;
      }
  });

  res.json({ history, stats });
});

// @desc    Simulate Risk & SPI (What-If Analysis)
// @route   POST /api/student/simulate
// @access  Private (Student)
const simulateRisk = asyncHandler(async (req, res) => {
  const { lecturesTotal, lecturesPresent, marksObtained, maxMarks } = req.body;

  const attPct = (lecturesPresent / lecturesTotal) * 100;
  const marksPct = (marksObtained / maxMarks) * 100;

  let riskScore = 0;
  let factors = [];
  let level = 'Safe';

  if (attPct < 75) {
      riskScore += 50;
      factors.push('Low Attendance (<75%)');
  }
  if (marksPct < 40) {
      riskScore += 30;
      factors.push('Low Marks (<40%)');
  }

  if (attPct < 75 && marksPct < 40) {
      level = 'High Risk';
      factors.push('CRITICAL: Both thresholds breached');
  } else if (attPct < 75 || marksPct < 40) {
      level = 'Moderate Risk';
  }

  // Simple SPI Projection Logic
  // Base SPI on marks percentage (scale 0-10)
  let projectedSPI = (marksPct / 10).toFixed(2);
  
  // Penalize for poor attendance
  if (attPct < 50) projectedSPI -= 1.0;
  else if (attPct < 75) projectedSPI -= 0.5;

  if (projectedSPI < 0) projectedSPI = 0;
  if (projectedSPI > 10) projectedSPI = 10;

  res.json({
    risk: {
        score: riskScore,
        level,
        factors
    },
    metrics: {
        attPct,
        marksPct,
        projectedSPI: Number(projectedSPI).toFixed(2)
    }
  });
});

// @desc    Upload Profile Picture
// @route   POST /api/student/profile-picture
// @access  Private (Student)
const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  // Store relative path for static serving
  const filePath = `uploads/${req.file.filename}`;
  
  student.profilePicture = filePath;
  await student.save();

  res.json({ message: 'Profile picture updated', filePath });
});

// @desc    Update Student Profile Details
// @route   PUT /api/student/profile
// @access  Private (Student)
const updateStudentProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, currentSemester } = req.body;

  const student = await Student.findOne({ userId: req.user._id });

  if (student) {
    student.firstName = firstName || student.firstName;
    student.lastName = lastName || student.lastName;
    student.currentSemester = currentSemester || student.currentSemester;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } else {
    res.status(404);
    throw new Error('Student not found');
  }
});

// @desc    Get Interventions (Notifications) for logged in student
// @route   GET /api/student/notifications
// @access  Private (Student)
const getMyNotifications = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const notifications = await Intervention.find({ studentId: student._id })
    .populate('mentorId', 'firstName lastName email')
    .sort({ createdAt: -1 });

  res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/student/notifications/:id/read
// @access  Private (Student)
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Intervention.findById(req.params.id);
  
  if (notification) {
    notification.isRead = true;
    await notification.save();
    res.json({ message: 'Notification marked as read' });
  } else {
    res.status(404);
    throw new Error('Notification not found');
  }
});

module.exports = { 
  getStudentDashboard, 
  getStudentAttendanceDetails, 
  simulateRisk, 
  uploadProfilePicture, 
  updateStudentProfile,
  getMyNotifications,
  markNotificationRead
};