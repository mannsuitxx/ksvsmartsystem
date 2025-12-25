const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getFacultyLoginList, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.get('/faculty-list', getFacultyLoginList);
router.get('/me', protect, getMe); // New Route
router.post('/register', registerUser);

module.exports = router;
