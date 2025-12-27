const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource');
const fs = require('fs');
const path = require('path');

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

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin)
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error('Resource not found');
  }

  // Delete file from filesystem
  // fileUrl is like /uploads/filename.ext
  // we need backend/uploads/filename.ext
  if (resource.fileUrl) {
      const filePath = path.join(__dirname, '..', resource.fileUrl);
      if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
      }
  }

  await Resource.deleteOne({ _id: req.params.id });
  res.json({ message: 'Resource removed' });
});

module.exports = {
  uploadResource,
  getResources,
  deleteResource
};
