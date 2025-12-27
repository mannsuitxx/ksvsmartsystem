const express = require('express');
const router = express.Router();
const { exportStudents, exportAttendance, exportRisk } = require('../controllers/exportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/students', protect, authorize('admin', 'hod'), exportStudents);
router.get('/attendance', protect, authorize('admin', 'hod', 'faculty'), exportAttendance);
router.get('/risk', protect, authorize('admin', 'hod', 'faculty', 'mentor'), exportRisk);

module.exports = router;
