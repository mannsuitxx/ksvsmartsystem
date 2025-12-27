const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const AcademicCalendar = require('../models/AcademicCalendar');
const SystemConfig = require('../models/SystemConfig');
const { generateMonthlyReports } = require('../utils/cronJobs');

// @desc    Get System Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getSystemStats = asyncHandler(async (req, res) => {
  const studentCount = await User.countDocuments({ role: 'student' });
  const facultyCount = await User.countDocuments({ role: 'faculty' });
  const mentorCount = await User.countDocuments({ role: 'mentor' });
  
  res.json({
      students: studentCount,
      faculty: facultyCount,
      mentors: mentorCount,
      totalUsers: studentCount + facultyCount + mentorCount
  });
});

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await User.deleteOne({ _id: user._id });
    await Student.deleteOne({ userId: user._id });
    await Faculty.deleteOne({ userId: user._id }); // Also remove faculty profile
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Create New User (Faculty/Mentor/HOD/Admin)
// @route   POST /api/admin/users
// @access  Private (Admin)
const createUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    res.status(400);
    throw new Error('Please provide email, password and role');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    email,
    passwordHash: password, // Will be hashed by pre-save hook
    role,
    isActive: true
  });

  res.status(201).json({
    _id: user._id,
    email: user.email,
    role: user.role,
    message: 'User created successfully'
  });
});

// @desc    Update User Role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);

  if (user) {
    user.role = role;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      message: 'User role updated'
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// ------------------------------------------------------------------
// 1. FACULTY MANAGEMENT
// ------------------------------------------------------------------

// @desc    Add Faculty Profile (Auto-creates User if needed)
// @route   POST /api/admin/faculty
// @access  Private (Admin)
const addFacultyProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, employeeId, department, designation } = req.body;
    
    // 1. Check if Faculty Profile exists
    const exists = await Faculty.findOne({ employeeId });
    if(exists) { res.status(400); throw new Error('Faculty with this Employee ID already exists'); }

    // 2. Check or Create User Account
    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            email,
            passwordHash: '123456', // Default Password per requirement
            role: 'faculty',
            isActive: true
        });
    } else {
        // Ensure role is at least faculty
        if (user.role === 'student') {
            user.role = 'faculty';
            await user.save();
        }
    }

    // 3. Create Profile linked to User
    const faculty = await Faculty.create({
        userId: user._id, 
        firstName, 
        lastName, 
        employeeId, 
        department, 
        designation
    });

    res.status(201).json({
        message: 'Faculty Profile & Login Created',
        faculty,
        credentials: { email: user.email, defaultPassword: '123456' }
    });
});

// @desc    Get All Faculty
// @route   GET /api/admin/faculty
// @access  Private (Admin)
const getAllFaculty = asyncHandler(async (req, res) => {
    const faculty = await Faculty.find({}).populate('userId', 'email role isActive');
    res.json(faculty);
});

// ------------------------------------------------------------------
// 2. MENTOR MANAGEMENT
// ------------------------------------------------------------------

// @desc    Assign Mentor Role & Mentees
// @route   POST /api/admin/assign-mentor
// @access  Private (Admin)
const assignMentor = asyncHandler(async (req, res) => {
    const { facultyId, studentIds } = req.body; // facultyId is User ID
    
    // 1. Update User Role to Mentor (if not already)
    const user = await User.findById(facultyId);
    if(user && user.role === 'faculty') {
        user.role = 'mentor';
        await user.save();
    }
    
    // 2. Update Faculty Profile
    const facultyProfile = await Faculty.findOne({ userId: facultyId });
    if(facultyProfile) {
        facultyProfile.isMentor = true;
        await facultyProfile.save();
    }

    // 3. Assign Students
    let updateResult = { modifiedCount: 0 };
    if (studentIds && studentIds.length > 0) {
        updateResult = await Student.updateMany(
            { _id: { $in: studentIds } },
            { $set: { mentorId: facultyId } }
        );
    }

    res.json({ 
        message: 'Mentor assigned and students mapped.',
        mappedCount: updateResult.modifiedCount
    });
});

// ------------------------------------------------------------------
// 4. DEPARTMENT & SUBJECT SETUP
// ------------------------------------------------------------------

const createDepartment = asyncHandler(async (req, res) => {
    const { name, code } = req.body;
    const dept = await Department.create({ name, code });
    res.status(201).json(dept);
});

const getDepartments = asyncHandler(async (req, res) => {
    const depts = await Department.find({});
    res.json(depts);
});

const createSubject = asyncHandler(async (req, res) => {
    const { name, code, department, semester, credits, type } = req.body;
    const sub = await Subject.create({ name, code, department, semester, credits, type });
    res.status(201).json(sub);
});

const getSubjects = asyncHandler(async (req, res) => {
    const subs = await Subject.find({});
    res.json(subs);
});

// ------------------------------------------------------------------
// 5. ACADEMIC CALENDAR
// ------------------------------------------------------------------

const addCalendarEvent = asyncHandler(async (req, res) => {
    const event = await AcademicCalendar.create(req.body);
    res.status(201).json(event);
});

const getCalendarEvents = asyncHandler(async (req, res) => {
    const events = await AcademicCalendar.find({}).sort({ startDate: 1 });
    res.json(events);
});

// ------------------------------------------------------------------
// 8. SYSTEM CONFIGURATION
// ------------------------------------------------------------------

const updateSystemConfig = asyncHandler(async (req, res) => {
    const { key, value, description } = req.body;
    const config = await SystemConfig.findOneAndUpdate(
        { key },
        { value, description, updatedBy: req.user._id },
        { new: true, upsert: true } // Create if not exists
    );
    res.json(config);
});

const getSystemConfig = asyncHandler(async (req, res) => {
    const configs = await SystemConfig.find({});
    res.json(configs);
});


// @desc    Reset Semester (Promote all students)
// @route   POST /api/admin/system/reset-semester
// @access  Private (Admin)
const resetSemester = asyncHandler(async (req, res) => {
    // Increment semester for all students
    const result = await Student.updateMany(
        {}, 
        { $inc: { currentSemester: 1 } }
    );
    
    // Optional: Archive students > 8 sem?
    // For now, simple promotion.
    
    res.json({ 
        message: 'Semester Reset Successful. Students Promoted.',
        affected: result.modifiedCount 
    });
});

// @desc    Download System Logs
// @route   GET /api/admin/system/logs
// @access  Private (Admin)
const downloadSystemLogs = asyncHandler(async (req, res) => {
    // Generate a log file on the fly
    // Include Email Logs, Class Updates (as proxy for activity)
    // and maybe some mock system events for "realism" if real audit log missing.
    
    const EmailLog = require('../models/EmailLog');
    const ClassUpdate = require('../models/ClassUpdate');
    
    const emailLogs = await EmailLog.find({}).limit(50).sort({createdAt: -1});
    const classLogs = await ClassUpdate.find({}).limit(50).sort({createdAt: -1});
    
    let logContent = "TIMESTAMP,TYPE,USER,DETAILS\n";
    
    emailLogs.forEach(l => {
        logContent += `${l.createdAt.toISOString()},EMAIL,${l.recipientEmail},Subject: ${l.subject}\n`;
    });
    
    classLogs.forEach(l => {
        logContent += `${l.createdAt.toISOString()},CLASS_UPDATE,FacultyID:${l.facultyId},Subject: ${l.subject} Status: ${l.status}\n`;
    });
    
    res.header('Content-Type', 'text/csv');
    res.attachment('system_audit_logs.csv');
    res.send(logContent);
});

// @desc    Manually Trigger Monthly Reports
// @route   POST /api/admin/system/trigger-reports
// @access  Private (Admin)
const triggerMonthlyReports = asyncHandler(async (req, res) => {
    // Run asynchronously to not block response if many students
    generateMonthlyReports().then(count => {
        console.log(`Manual Report Trigger Finished. Sent ${count} emails.`);
    });
    
    res.json({ message: 'Monthly Reports Generation Started in Background.' });
});

module.exports = { 
    getSystemStats, getAllUsers, deleteUser, createUser, updateUserRole,
    addFacultyProfile, getAllFaculty,
    assignMentor,
    createDepartment, getDepartments, createSubject, getSubjects,
    addCalendarEvent, getCalendarEvents,
    updateSystemConfig, getSystemConfig,
    resetSemester, downloadSystemLogs,
    triggerMonthlyReports
};
