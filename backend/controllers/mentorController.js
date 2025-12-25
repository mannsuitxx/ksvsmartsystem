const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const LectureAttendance = require('../models/LectureAttendance');
const Intervention = require('../models/Intervention');

// @desc    Get Mentees assigned to the logged-in Mentor
// @route   GET /api/mentor/mentees
// @access  Private (Mentor)
const getMyMentees = asyncHandler(async (req, res) => {
  // In a real system, we filter by { mentorId: req.user._id }
  // For this prototype, if no mentees are assigned, we return all students 
  // so you can see the UI working.
  let mentees = await Student.find({ mentorId: req.user._id });
  
  if (mentees.length === 0) {
      // Fallback for prototype: Return all students from "Computer Engineering"
      mentees = await Student.find({ department: 'Computer Engineering' });
  }

  res.json(mentees);
});

// @desc    Log a Mentor Intervention (e.g., Remedial Class)
// @route   POST /api/mentor/intervention
// @access  Private (Mentor)
const logIntervention = asyncHandler(async (req, res) => {
  const { studentId, type, remarks, status, actionPlan, date } = req.body;
  
  if(!studentId || !type || !remarks) {
      res.status(400); 
      throw new Error("Missing required data (studentId, type, remarks)");
  }

  const intervention = await Intervention.create({
      studentId,
      mentorId: req.user._id,
      type,
      remarks,
      status: status || 'Open',
      actionPlan,
      date: date || new Date()
  });

  res.status(201).json(intervention);
});

// @desc    Get Interventions for a Student
// @route   GET /api/mentor/intervention/:studentId
// @access  Private (Mentor, Faculty)
const getStudentInterventions = asyncHandler(async (req, res) => {
    const interventions = await Intervention.find({ studentId: req.params.studentId })
        .populate('mentorId', 'firstName lastName')
        .sort({ date: -1 });
    res.json(interventions);
});

// @desc    Get Analytics for Mentor Dashboard
// @route   GET /api/mentor/analytics
// @access  Private (Mentor)
const getMentorAnalytics = asyncHandler(async (req, res) => {
  const mentorId = req.user._id;

  // 1. Get Mentees
  let mentees = await Student.find({ mentorId });
  if (mentees.length === 0) {
      // Fallback for prototype
      mentees = await Student.find({ department: 'Computer Engineering' });
  }

  // 2. Get Interventions
  const interventions = await Intervention.find({ mentorId }).populate('studentId', 'firstName lastName riskProfile');

  // 3. Workload Stats
  const totalMentees = mentees.length;
  const criticalMentees = mentees.filter(m => m.riskProfile && m.riskProfile.level === 'Critical').length; // Assuming riskProfile structure
  // Note: Student schema has riskProfile object
  
  const pendingInterventions = interventions.filter(i => i.status !== 'Closed').length;

  // 4. Effectiveness Stats
  // Logic: Group by student. If student received intervention > 2 weeks ago and is now SAFE, count as success.
  let successCount = 0;
  let totalEvaluated = 0;
  
  const evaluatedStudents = new Set();

  interventions.forEach(i => {
      if (!i.studentId) return; // Deleted student?
      if (evaluatedStudents.has(i.studentId._id.toString())) return; // Count each student once
      
      // Simple heuristic: If risk is Safe/Moderate, we claim success. If Critical, we claim failure.
      const currentRisk = i.studentId.riskProfile ? i.studentId.riskProfile.level : 'Safe';
      
      if (currentRisk !== 'High Risk' && currentRisk !== 'Critical') {
          successCount++;
      }
      totalEvaluated++;
      evaluatedStudents.add(i.studentId._id.toString());
  });

  const effectivenessRate = totalEvaluated === 0 ? 0 : ((successCount / totalEvaluated) * 100).toFixed(1);

  res.json({
      workload: {
          totalMentees,
          criticalRisk: criticalMentees,
          pendingInterventions,
          menteeList: mentees.map(m => ({
             id: m._id,
             name: `${m.firstName} ${m.lastName}`,
             enrollment: m.enrollmentNumber,
             riskLevel: m.riskProfile ? m.riskProfile.level : 'Safe',
             lastMeeting: 'Pending' // Would need to query latest intervention per student
          }))
      },
      effectiveness: {
          rate: effectivenessRate,
          totalInterventions: interventions.length,
          recentHistory: interventions.slice(0, 10) // Last 10
      }
  });
});

module.exports = { getMyMentees, logIntervention, getStudentInterventions, getMentorAnalytics };
