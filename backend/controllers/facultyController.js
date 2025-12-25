const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const LectureAttendance = require('../models/LectureAttendance');
const InternalMarks = require('../models/InternalMarks');
const fs = require('fs');
const csv = require('csv-parser');

const Intervention = require('../models/Intervention');

// @desc    Get all students
const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({}).sort({ enrollmentNumber: 1 });
  res.json(students);
});

// @desc    Get Attendance History for Faculty
const getAttendanceHistory = asyncHandler(async (req, res) => {
  const history = await LectureAttendance.find({ facultyId: req.user._id })
    .sort({ date: -1 })
    .limit(20); // Last 20 records
  res.json(history);
});

// @desc    Upload Attendance (JSON Manual)
const uploadAttendance = asyncHandler(async (req, res) => {
  const { subjectName, date, records } = req.body;
  
  await LectureAttendance.create({
    subjectName,
    facultyId: req.user._id,
    date: new Date(date),
    records
  });
  
  res.status(201).json({ message: 'Attendance Submitted' });
});

// @desc    Upload Attendance (CSV File)
const uploadAttendanceCSV = asyncHandler(async (req, res) => {
  const results = [];
  const { subjectName, date } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const students = await Student.find({});
        const records = [];

        for (const row of results) {
            // 1. Normalize Keys
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                normalizedRow[cleanKey] = row[key];
            });

            // 2. Extract Data
            const enrollment = normalizedRow['enrollment'] || normalizedRow['enrollmentno'] || normalizedRow['enrollmentnumber'];
            const status = normalizedRow['status'] || normalizedRow['attendance'] || 'P'; // Default to Present if missing? No, better to be strict or use P/A. Let's assume input has status.

            if (!enrollment) continue;

            // 3. Find Student
            // Note: In production, use a Map for O(1) lookup instead of find() O(N) inside loop
            const student = students.find(s => 
                s.enrollmentNumber.trim().toLowerCase() === enrollment.trim().toLowerCase()
            );

            if (student && status) {
                records.push({
                    studentId: student._id,
                    status: status.trim().toUpperCase().charAt(0) // Ensure 'P' or 'A'
                });
            }
        }

        if (records.length > 0) {
            await LectureAttendance.create({
                subjectName,
                facultyId: req.user._id,
                date: new Date(date),
                records
            });
            // Cleanup file
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            
            res.status(201).json({ message: `Success! Uploaded attendance for ${records.length} students.` });
        } else {
            // Cleanup file
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            
            res.status(400).json({ message: 'Failed. No matching students found. Check Enrollment Numbers.' });
        }
      } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'CSV Processing Error: ' + error.message });
      }
    });
});

// @desc    Upload Marks (CSV File)
const uploadMarksCSV = asyncHandler(async (req, res) => {
  const results = [];
  const { subjectName, examType, maxMarks } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const students = await Student.find({});
        const records = [];

        for (const row of results) {
            // 1. Normalize Keys
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                normalizedRow[cleanKey] = row[key];
            });

            // 2. Extract Data
            const enrollment = normalizedRow['enrollment'] || normalizedRow['enrollmentno'] || normalizedRow['enrollmentnumber'];
            const marksObtained = normalizedRow['marks'] || normalizedRow['obtained'] || normalizedRow['marksobtained'];

            if (!enrollment) continue;

            // 3. Find Student
            const student = students.find(s => 
                s.enrollmentNumber.trim().toLowerCase() === enrollment.trim().toLowerCase()
            );

            if (student && marksObtained !== undefined) {
                records.push({
                    studentId: student._id,
                    subjectName,
                    semester: 5, // Defaulting to 5 as per existing logic, or could be dynamic
                    examType: examType || 'Mid-Sem',
                    maxMarks: Number(maxMarks),
                    marksObtained: Number(marksObtained)
                });
            }
        }

        if (records.length > 0) {
            await InternalMarks.insertMany(records);
            
            // Cleanup file
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            
            res.status(201).json({ message: `Success! Uploaded marks for ${records.length} students.` });
        } else {
            // Cleanup file
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            
            res.status(400).json({ message: 'Failed. No matching students found or invalid CSV format.' });
        }
      } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'CSV Processing Error: ' + error.message });
      }
    });
});

// @desc    Upload Marks
const uploadMarks = asyncHandler(async (req, res) => {
  const { subjectName, examType, maxMarks, records } = req.body;

  const marksToInsert = records.map(rec => ({
    studentId: rec.studentId,
    subjectName,
    semester: 5,
    examType,
    maxMarks,
    marksObtained: rec.marksObtained
  }));

  await InternalMarks.insertMany(marksToInsert);

  res.status(201).json({ message: 'Marks Uploaded Successfully' });
});

// @desc    Get Aggregated Analytics for Faculty Dashboard
// @route   GET /api/faculty/analytics
// @access  Private (Faculty)
const getFacultyAnalytics = asyncHandler(async (req, res) => {
  const facultyId = req.user._id;

  // 1. Fetch all attendance records for this faculty
  const attendanceRecords = await LectureAttendance.find({ facultyId }).sort({ date: 1 });
  
  // 2. Fetch all students for name mapping
  const students = await Student.find({}).select('firstName lastName enrollmentNumber');
  const studentMap = {};
  students.forEach(s => studentMap[s._id.toString()] = s);

  // --- PROCESSING ATTENDANCE ---
  const subjectStats = {}; // { "Java": { totalLectures: 10, students: { id: { present: 5, consecutiveAbsent: 2 } } } }
  const lowEngagementList = [];

  attendanceRecords.forEach(record => {
      const sub = record.subjectName;
      if (!subjectStats[sub]) subjectStats[sub] = { totalLectures: 0, dates: [], studentStats: {} };
      
      subjectStats[sub].totalLectures++;
      subjectStats[sub].dates.push(record.date);

      record.records.forEach(r => {
          const sid = r.studentId.toString();
          if (!subjectStats[sub].studentStats[sid]) {
              subjectStats[sub].studentStats[sid] = { present: 0, streak: 0, history: [] };
          }
          
          const stats = subjectStats[sub].studentStats[sid];
          stats.history.push(r.status);

          if (r.status === 'P') {
              stats.present++;
              stats.streak = 0; // Reset absent streak
          } else {
              stats.streak++;
          }
      });
  });

  // Identify Low Engagement
  Object.keys(subjectStats).forEach(sub => {
      const subData = subjectStats[sub];
      Object.keys(subData.studentStats).forEach(sid => {
          const stats = subData.studentStats[sid];
          const pct = (stats.present / subData.totalLectures) * 100;
          
          // Rule: < 50% Attendance OR > 3 Consecutive Absences
          if (pct < 50 || stats.streak >= 3) {
              const studentInfo = studentMap[sid];
              if (studentInfo) {
                  lowEngagementList.push({
                      studentId: sid,
                      name: `${studentInfo.firstName} ${studentInfo.lastName}`,
                      enrollment: studentInfo.enrollmentNumber,
                      subject: sub,
                      attendancePct: pct.toFixed(1),
                      consecutiveAbsences: stats.streak,
                      riskType: stats.streak >= 3 ? 'Consecutive Absences' : 'Low Attendance'
                  });
              }
          }
      });
  });

  // --- PROCESSING MARKS (Assessment Difficulty) ---
  // Find marks for subjects this faculty teaches
  const mySubjects = Object.keys(subjectStats);
  const marksData = await InternalMarks.find({ subjectName: { $in: mySubjects } });

  const assessmentAnalysis = {}; // { "Java - Mid": { total: 100, passed: 80, scores: [] } }

  marksData.forEach(m => {
      const key = `${m.subjectName} - ${m.examType}`;
      if (!assessmentAnalysis[key]) {
          assessmentAnalysis[key] = { 
              subject: m.subjectName,
              exam: m.examType,
              totalStudents: 0, 
              passedCount: 0, 
              totalMarksObtained: 0,
              maxMarks: m.maxMarks,
              scores: [] 
          };
      }
      
      const entry = assessmentAnalysis[key];
      entry.totalStudents++;
      entry.totalMarksObtained += m.marksObtained;
      entry.scores.push(m.marksObtained);

      if ((m.marksObtained / m.maxMarks) >= 0.4) {
          entry.passedCount++;
      }
  });

  const assessmentReport = Object.values(assessmentAnalysis).map(a => {
      const avg = a.totalMarksObtained / a.totalStudents;
      const passRate = (a.passedCount / a.totalStudents) * 100;
      
      // Skewness Detection
      let status = 'Balanced';
      if (passRate < 50) status = 'Too Hard / Poor Performance';
      if (passRate > 95) status = 'Too Easy / Grade Inflation';

      return { ...a, averageScore: avg.toFixed(1), passRate: passRate.toFixed(1), status };
  });

  res.json({
      lowEngagement: lowEngagementList,
      classHealth: Object.keys(subjectStats).map(sub => ({
          subject: sub,
          totalLectures: subjectStats[sub].totalLectures,
          avgAttendance: 0 // Placeholder, could calculate avg of all students
      })),
      assessments: assessmentReport
  });
});

// @desc    Send Nudge/Notification to Student
// @route   POST /api/faculty/notify
// @access  Private (Faculty)
const notifyStudent = asyncHandler(async (req, res) => {
    const { studentId, message } = req.body;
    
    if (!studentId || !message) {
        res.status(400);
        throw new Error('Student ID and Message are required');
    }

    const intervention = await Intervention.create({
        studentId,
        mentorId: req.user._id, // Sender (Faculty)
        type: 'Nudge',
        remarks: message,
        status: 'Open',
        date: new Date(),
        isRead: false
    });

    res.status(201).json({ message: 'Notification Sent', intervention });
});

module.exports = { getStudents, getAttendanceHistory, uploadAttendance, uploadAttendanceCSV, uploadMarks, uploadMarksCSV, getFacultyAnalytics, notifyStudent };
