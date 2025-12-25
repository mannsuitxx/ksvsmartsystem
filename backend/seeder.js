const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const LectureAttendance = require('./models/LectureAttendance');
const InternalMarks = require('./models/InternalMarks');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Student.deleteMany();
    await LectureAttendance.deleteMany();
    await InternalMarks.deleteMany();

    // 1. Create Users for ALL Roles
    const passwordHash = '123456'; // Pre-hashed logic handled in model or dev shortcut
    
    const users = [
        { email: 'student@ksv.ac.in', role: 'student' },
        { email: 'faculty@ksv.ac.in', role: 'faculty' },
        { email: 'mentor@ksv.ac.in', role: 'mentor' },
        { email: 'hod@ksv.ac.in', role: 'hod' },
        { email: 'admin@ksv.ac.in', role: 'admin' }
    ];

    for (const u of users) {
        await User.create({
            email: u.email,
            passwordHash: passwordHash,
            role: u.role
        });
    }

    const studentUser = await User.findOne({ email: 'student@ksv.ac.in' });
    const facultyUser = await User.findOne({ email: 'faculty@ksv.ac.in' });
    const mentorUser = await User.findOne({ email: 'mentor@ksv.ac.in' });

    console.log('Users Created (Student, Faculty, Mentor, HOD, Admin)');

    // 2. Create Student Profile linked to Student User
    const studentProfile = await Student.create({
        userId: studentUser._id,
        enrollmentNumber: 'KSV2025001',
        firstName: 'Rahul',
        lastName: 'Patel',
        email: 'student@ksv.ac.in',
        department: 'Computer Engineering',
        currentSemester: 5,
        division: 'A',
        mentorId: mentorUser._id, // Assign to Mentor
        riskProfile: { score: 45, level: 'Moderate' }
    });

    console.log('Student Profile Created');

    // 3. Create Attendance Records
    // Subject: Java (Low attendance scenario)
    await LectureAttendance.create({
        subjectName: 'Java Programming',
        date: new Date(),
        records: [
            { studentId: studentProfile._id, status: 'P' }
        ]
    });
    // Create bulk dummy attendance
    const attendanceDocs = [];
    for(let i=0; i<10; i++) {
        attendanceDocs.push({
            subjectName: 'Java Programming',
            date: new Date(),
            records: [{ studentId: studentProfile._id, status: i < 6 ? 'P' : 'A' }] // 60% attendance
        });
    }
    for(let i=0; i<10; i++) {
        attendanceDocs.push({
            subjectName: 'Data Structures',
            date: new Date(),
            records: [{ studentId: studentProfile._id, status: 'P' }] // 100% attendance
        });
    }
    await LectureAttendance.insertMany(attendanceDocs);

    console.log('Attendance Data Seeded');

    // 4. Create Marks
    await InternalMarks.create([
        {
            studentId: studentProfile._id,
            subjectName: 'Java Programming',
            semester: 5,
            examType: 'Mid-Sem',
            marksObtained: 12,
            maxMarks: 30 // Fail (<35%)
        },
        {
            studentId: studentProfile._id,
            subjectName: 'Data Structures',
            semester: 5,
            examType: 'Mid-Sem',
            marksObtained: 28,
            maxMarks: 30 // Pass
        }
    ]);

    console.log('Marks Data Seeded');
    console.log('DATA IMPORTED SUCCESS!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
