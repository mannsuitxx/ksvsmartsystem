const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const User = require('../models/User'); // Need to create Users for students if they don't exist? For now, we assume simple profile creation.
const fs = require('fs');
const csv = require('csv-parser');

// @desc    Search and Filter Students
// @route   GET /api/students
// @access  Private (Faculty/Admin)
const searchStudents = asyncHandler(async (req, res) => {
  const { q, department, semester } = req.query;

  let query = {};

  // Text Search (Enrollment or Name)
  if (q) {
    const regex = new RegExp(q, 'i');
    query.$or = [
      { firstName: regex },
      { lastName: regex },
      { enrollmentNumber: regex }
    ];
  }

  // Filters
  if (department) query.department = department;
  if (semester) query.currentSemester = Number(semester);

  const students = await Student.find(query).sort({ enrollmentNumber: 1 });
  res.json(students);
});

// @desc    Bulk Upload Students via CSV
// @route   POST /api/students/upload
// @access  Private (Faculty/Admin)
const uploadStudents = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No CSV file uploaded');
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        let successCount = 0;

        // Process row by row to ensure User creation
        for (const row of results) {
            // 1. Normalize Row Keys
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                normalizedRow[cleanKey] = row[key];
            });

            // 2. Extract Data
            let enrollment = normalizedRow['enrollmentno'] || normalizedRow['enrollment'] || normalizedRow['enrollmentnumber'];
            let name = normalizedRow['name'] || normalizedRow['studentname'];
            let email = normalizedRow['email'] || normalizedRow['studentemail'];
            const dept = normalizedRow['department'] || normalizedRow['dept'];
            const sem = normalizedRow['semester'] || normalizedRow['sem'] || normalizedRow['currentsemester'];
            const parentEmail = normalizedRow['parentemail'] || normalizedRow['parent_email'] || normalizedRow['pemail'];

            if (!enrollment || !name || !email) {
                console.log('Skipping invalid row:', row);
                continue;
            }

            // Sanitization
            email = email.trim().toLowerCase();
            enrollment = enrollment.trim();
            name = name.trim();

            // 3. Find or Create USER (Login Access)
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    email,
                    passwordHash: '123456', // Default Password
                    role: 'student',
                    isActive: true
                });
            }

            // 4. Update or Create STUDENT Profile
            const nameParts = name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '.';

            await Student.updateOne(
                { enrollmentNumber: enrollment },
                {
                    $set: {
                        userId: user._id, // Link to User
                        enrollmentNumber: enrollment,
                        firstName,
                        lastName,
                        email, // For redundancy/display
                        department: dept || 'General',
                        currentSemester: sem ? Number(sem) : 1,
                        division: 'A',
                        parentEmail: parentEmail ? parentEmail.trim().toLowerCase() : undefined
                    }
                },
                { upsert: true }
            );
            successCount++;
        }

        // Cleanup
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.status(201).json({ 
            message: `Successfully processed ${successCount} records. Accounts created if missing.`,
            count: successCount 
        });

      } catch (error) {
        console.error(error);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server Error during upload: ' + error.message });
      }
    });
});

// @desc    Add Single Student & Create Login
// @route   POST /api/students/add
// @access  Private (Faculty/Admin)
const addSingleStudent = asyncHandler(async (req, res) => {
  const { enrollmentNumber, firstName, lastName, email, department, currentSemester, parentEmail } = req.body;

  if (!enrollmentNumber || !email || !firstName) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  // 1. Check if User/Email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // 2. Create User (Login Access)
  // Default password: '123456'
  const user = await User.create({
    email,
    passwordHash: '123456', 
    role: 'student',
    isActive: true
  });

  // 3. Create Student Profile
  const student = await Student.create({
    userId: user._id,
    enrollmentNumber,
    firstName,
    lastName,
    email, // Redundant but useful
    department,
    currentSemester,
    division: 'A', // Default
    parentEmail,
    riskProfile: { score: 0, level: 'Safe' }
  });

  res.status(201).json({
    message: 'Student Added & Access Granted!',
    credentials: { email: user.email, password: '123456' },
    student
  });
});

// @desc    Get Student by ID (or Enrollment Number)
// @route   GET /api/students/:id
// @access  Private (Faculty/Admin)
const getStudentById = asyncHandler(async (req, res) => {
  console.log(`[DEBUG] getStudentById called with param: ${req.params.id}`);
  
  let student;
  
  // Check if valid ObjectId
  const cleanId = req.params.id.trim();
  
  if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
    student = await Student.findById(cleanId);
  }

  // If not found by ID (or not valid ID), try Enrollment Number
  if (!student) {
    console.log(`[DEBUG] Not found by ID '${cleanId}', trying Enrollment Number...`);
    // Case-insensitive search for enrollment number
    student = await Student.findOne({ 
        enrollmentNumber: { $regex: new RegExp(`^${cleanId}$`, 'i') } 
    });
  }

  if (student) {
    console.log('[DEBUG] Student found');
    res.json(student);
  } else {
    console.log('[DEBUG] Student NOT found in DB. Available Students (first 5):');
    const sample = await Student.find({}).limit(5).select('_id enrollmentNumber');
    console.log(sample);
    
    res.status(404);
    throw new Error(`Student not found. Checked ID/Enrollment: ${cleanId}`);
  }
});

// @desc    Delete Student & User Account
// @route   DELETE /api/students/:id
// @access  Private (Faculty/Admin)
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // 1. Delete Linked User Account (Login Access)
  if (student.userId) {
    await User.findByIdAndDelete(student.userId);
  }

  // 2. Delete Student Profile
  await Student.deleteOne({ _id: student._id });

  res.json({ message: 'Student and linked account removed' });
});

module.exports = { searchStudents, uploadStudents, addSingleStudent, deleteStudent, getStudentById };
