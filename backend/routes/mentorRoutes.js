const express = require('express');
const router = express.Router();
const { getMyMentees, logIntervention, getStudentInterventions, getMentorAnalytics } = require('../controllers/mentorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('mentor', 'faculty', 'hod')); // Allow Faculty/HOD to view mentor stuff if needed

router.get('/analytics', getMentorAnalytics);
router.get('/mentees', getMyMentees);
router.post('/intervention', logIntervention);
router.get('/intervention/:studentId', getStudentInterventions);

module.exports = router;
