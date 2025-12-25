const express = require('express');
const router = express.Router();
const { searchStudents, uploadStudents, addSingleStudent, deleteStudent, getStudentById } = require('../controllers/studentManagementController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(authorize('faculty', 'admin', 'mentor'));

router.get('/', searchStudents);
router.get('/:id', getStudentById);
router.post('/add', addSingleStudent);
router.post('/upload', upload.single('file'), uploadStudents);
router.delete('/:id', deleteStudent);

module.exports = router;
