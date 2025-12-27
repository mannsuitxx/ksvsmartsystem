const express = require('express');
const router = express.Router();
const {
  addAchievement,
  getMyAchievements,
  getPendingAchievements,
  updateAchievementStatus
} = require('../controllers/achievementController');
const { protect, authorize } = require('../middleware/authMiddleware');
const uploadFile = require('../middleware/fileUploadMiddleware');

router.post('/', protect, authorize('student'), uploadFile.single('certificate'), addAchievement);
router.get('/my', protect, authorize('student'), getMyAchievements);
router.get('/pending', protect, authorize('mentor', 'admin'), getPendingAchievements);
router.put('/:id', protect, authorize('mentor', 'admin'), updateAchievementStatus);

module.exports = router;
