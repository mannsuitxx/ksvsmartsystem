const asyncHandler = require('express-async-handler');
const Achievement = require('../models/Achievement');
const Student = require('../models/Student');

// @desc    Add new achievement
// @route   POST /api/achievements
// @access  Private (Student)
const addAchievement = asyncHandler(async (req, res) => {
  const { title, description, date } = req.body;
  const certificateUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!certificateUrl) {
    res.status(400);
    throw new Error('Certificate file is required');
  }

  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
  }

  const achievement = await Achievement.create({
    studentId: student._id,
    title,
    description,
    date,
    certificateUrl,
    status: 'pending'
  });

  res.status(201).json(achievement);
});

// @desc    Get my achievements
// @route   GET /api/achievements/my
// @access  Private (Student)
const getMyAchievements = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
  }
  const achievements = await Achievement.find({ studentId: student._id }).sort({ createdAt: -1 });
  res.json(achievements);
});

// @desc    Get pending achievements
// @route   GET /api/achievements/pending
// @access  Private (Mentor/Admin)
const getPendingAchievements = asyncHandler(async (req, res) => {
  // If mentor, maybe only show their students? For now show all pending.
  const achievements = await Achievement.find({ status: 'pending' })
    .populate('studentId', 'firstName lastName enrollmentNumber')
    .sort({ createdAt: 1 });
  res.json(achievements);
});

// @desc    Update achievement status
// @route   PUT /api/achievements/:id
// @access  Private (Mentor/Admin)
const updateAchievementStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const achievement = await Achievement.findById(req.params.id);

  if (!achievement) {
    res.status(404);
    throw new Error('Achievement not found');
  }

  achievement.status = status;
  achievement.verifiedBy = req.user._id;
  achievement.remarks = remarks;

  const updatedAchievement = await achievement.save();
  res.json(updatedAchievement);
});

module.exports = {
  addAchievement,
  getMyAchievements,
  getPendingAchievements,
  updateAchievementStatus
};
