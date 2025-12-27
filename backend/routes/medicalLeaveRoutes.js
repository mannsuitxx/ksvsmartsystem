const express = require('express');
const router = express.Router();
const {
  applyMedicalLeave,
  getMyLeaves,
  getPendingLeaves,
  updateLeaveStatus,
  getStudentLeaves
} = require('../controllers/medicalLeaveController');
const { protect, authorize } = require('../middleware/authMiddleware');
const uploadFile = require('../middleware/fileUploadMiddleware');

router.post('/', protect, authorize('student'), uploadFile.single('certificate'), applyMedicalLeave);
router.get('/my', protect, authorize('student'), getMyLeaves);
router.get('/pending', protect, authorize('mentor'), getPendingLeaves);
router.get('/student/:id', protect, authorize('faculty', 'mentor', 'admin'), getStudentLeaves);
router.put('/:id', protect, authorize('mentor'), updateLeaveStatus);

module.exports = router;
