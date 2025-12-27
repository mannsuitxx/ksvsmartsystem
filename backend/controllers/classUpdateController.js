const asyncHandler = require('express-async-handler');
const ClassUpdate = require('../models/ClassUpdate');

// @desc    Update class status
// @route   POST /api/class-updates
// @access  Private (Faculty)
const addClassUpdate = asyncHandler(async (req, res) => {
  const { subject, date, topic, status, remarks } = req.body;

  const update = await ClassUpdate.create({
    facultyId: req.user._id,
    subject,
    date,
    topic,
    status,
    remarks
  });

  res.status(201).json(update);
});

// @desc    Get class updates
// @route   GET /api/class-updates
// @access  Private (Admin/HOD/Faculty)
const getClassUpdates = asyncHandler(async (req, res) => {
  // If faculty, return their own. If Admin/HOD return all.
  let query = {};
  if (req.user.role === 'faculty') {
      query.facultyId = req.user._id;
  }

  const updates = await ClassUpdate.find(query)
    .populate('facultyId', 'name')
    .sort({ date: -1 });
  res.json(updates);
});

module.exports = {
  addClassUpdate,
  getClassUpdates
};
