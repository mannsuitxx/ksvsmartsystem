const express = require('express');
const router = express.Router();
const { getStudents, getAttendanceHistory, uploadAttendance, uploadAttendanceCSV, uploadMarks, uploadMarksCSV, getFacultyAnalytics, notifyStudent } = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(authorize('faculty', 'mentor', 'admin')); // Allow Admin, Faculty, and Mentor to access these APIs

router.get('/analytics', getFacultyAnalytics);
router.post('/notify', notifyStudent);
router.get('/students', getStudents);
router.get('/history', getAttendanceHistory);
router.post('/attendance', uploadAttendance); // Manual JSON
router.post('/upload-csv', upload.single('file'), uploadAttendanceCSV); // CSV File
router.post('/marks/csv', upload.single('file'), uploadMarksCSV); // Marks CSV
router.post('/marks', uploadMarks);

module.exports = router;