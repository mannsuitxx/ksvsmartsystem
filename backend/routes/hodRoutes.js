const express = require('express');
const router = express.Router();
const { getAnalytics, getDeepAnalytics } = require('../controllers/hodController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('hod', 'admin')); // Only HOD/Admin

router.get('/analytics', getAnalytics);
router.get('/deep-analytics', getDeepAnalytics);

module.exports = router;
