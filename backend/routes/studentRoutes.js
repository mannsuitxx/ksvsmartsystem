const express = require('express');
const router = express.Router();
console.log('[DEBUG] Registering Student Routes...');
const { 
  getStudentDashboard, 
  getStudentAttendanceDetails, 
  simulateRisk, 
  uploadProfilePicture, 
  updateStudentProfile,
  getMyNotifications,
  markNotificationRead
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/dashboard', protect, authorize('student'), getStudentDashboard);
router.get('/attendance/:studentId', protect, authorize('student', 'faculty', 'mentor'), getStudentAttendanceDetails);
router.post('/simulate', protect, authorize('student'), simulateRisk);
router.post('/profile-picture', protect, authorize('student'), upload.single('image'), uploadProfilePicture);
router.put('/profile', protect, authorize('student'), updateStudentProfile);
router.get('/notifications', protect, authorize('student'), getMyNotifications);
router.put('/notifications/:id/read', protect, authorize('student'), markNotificationRead);

module.exports = router;
