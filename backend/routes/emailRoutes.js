const express = require('express');
const router = express.Router();
const { sendParentEmail, sendStudentEmail, getEmailLogs } = require('../controllers/emailController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/parent', protect, authorize('mentor', 'admin'), sendParentEmail);
router.post('/student', protect, authorize('mentor', 'admin'), sendStudentEmail);
router.get('/logs', protect, authorize('admin'), getEmailLogs);

module.exports = router;
