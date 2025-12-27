const express = require('express');
const router = express.Router();
const { 
    getSystemStats, getAllUsers, deleteUser, createUser, updateUserRole,
    addFacultyProfile, getAllFaculty,
    assignMentor,
    createDepartment, getDepartments, createSubject, getSubjects,
    addCalendarEvent, getCalendarEvents,
    updateSystemConfig, getSystemConfig,
    resetSemester, downloadSystemLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Faculty & Mentor
router.post('/faculty', addFacultyProfile);
router.get('/faculty', getAllFaculty);
router.post('/mentor/assign', assignMentor);

// Dept & Subjects
router.post('/departments', createDepartment);
router.get('/departments', getDepartments);
router.post('/subjects', createSubject);
router.get('/subjects', getSubjects);

// Calendar
router.post('/calendar', addCalendarEvent);
router.get('/calendar', getCalendarEvents);

// System Config
router.post('/config', updateSystemConfig);
router.get('/config', getSystemConfig);
router.post('/system/reset-semester', resetSemester);
router.get('/system/logs', downloadSystemLogs);
router.post('/system/trigger-reports', require('../controllers/adminController').triggerMonthlyReports);

module.exports = router;
