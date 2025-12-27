const asyncHandler = require('express-async-handler');
const MedicalLeave = require('../models/MedicalLeave');
const Student = require('../models/Student');

// @desc    Apply for medical leave
// @route   POST /api/leaves
// @access  Private (Student)
const applyMedicalLeave = asyncHandler(async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  const certificateUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!certificateUrl) {
    res.status(400);
    throw new Error('Medical certificate is required');
  }

  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
  }

  const leave = await MedicalLeave.create({
    studentId: student._id,
    startDate,
    endDate,
    reason,
    certificateUrl,
    status: 'pending'
  });

  res.status(201).json(leave);
});

// @desc    Get my leaves
// @route   GET /api/leaves/my
// @access  Private (Student)
const getMyLeaves = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
  }
  const leaves = await MedicalLeave.find({ studentId: student._id }).sort({ createdAt: -1 });
  res.json(leaves);
});

// @desc    Get pending leaves (for Mentor)
// @route   GET /api/leaves/pending
// @access  Private (Mentor)
const getPendingLeaves = asyncHandler(async (req, res) => {
  // Ideally filter by mentor's assigned students
  const leaves = await MedicalLeave.find({ status: 'pending' })
    .populate('studentId', 'firstName lastName enrollmentNumber')
    .sort({ createdAt: 1 });
  res.json(leaves);
});

// @desc    Update leave status
// @route   PUT /api/leaves/:id
// @access  Private (Mentor)
const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status, mentorRemarks } = req.body;
  const leave = await MedicalLeave.findById(req.params.id);

  if (!leave) {
    res.status(404);
    throw new Error('Leave application not found');
  }

  leave.status = status;
  leave.mentorRemarks = mentorRemarks;
  leave.approvedBy = req.user._id;

  const updatedLeave = await leave.save();
  res.json(updatedLeave);
});

// @desc    Get leaves by student ID (or Enrollment Number)
// @route   GET /api/leaves/student/:id
// @access  Private (Faculty/Mentor/Admin)
const getStudentLeaves = asyncHandler(async (req, res) => {
  const id = req.params.id;
  let student;

  // Check if valid ObjectId
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    student = await Student.findById(id);
  }

  // If not found by ID, try Enrollment Number
  if (!student) {
    student = await Student.findOne({ enrollmentNumber: id });
  }

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  const leaves = await MedicalLeave.find({ studentId: student._id }).sort({ createdAt: -1 });
  res.json(leaves);
});

module.exports = {
  applyMedicalLeave,
  getMyLeaves,
  getPendingLeaves,
  updateLeaveStatus,
  getStudentLeaves
};
