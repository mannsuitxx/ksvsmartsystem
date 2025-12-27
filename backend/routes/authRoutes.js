const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getFacultyLoginList, getMe, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.get('/faculty-list', getFacultyLoginList);
router.get('/me', protect, getMe);

module.exports = router;
