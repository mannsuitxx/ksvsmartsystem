const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource');

// @desc    Upload new resource (Exam Paper)
// @route   POST /api/resources
// @access  Private (Admin)
const uploadResource = asyncHandler(async (req, res) => {
  const { title, subject, semester, year, type } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!fileUrl) {
    res.status(400);
    throw new Error('File is required');
  }

  const resource = await Resource.create({
    title,
    subject,
    semester,
    year,
    type: type || 'exam_paper',
    fileUrl,
    uploadedBy: req.user._id
  });

  res.status(201).json(resource);
});

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private (Student/Faculty/Admin)
const getResources = asyncHandler(async (req, res) => {
  const { subject, semester, type } = req.query;
  const query = {};
  
  if (subject) query.subject = subject;
  if (semester) query.semester = semester;
  if (type) query.type = type;

  const resources = await Resource.find(query).sort({ year: -1 });
  res.json(resources);
});

module.exports = {
  uploadResource,
  getResources
};
