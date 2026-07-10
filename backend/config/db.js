const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import models for seeding
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const LectureAttendance = require('../models/LectureAttendance');
const InternalMarks = require('../models/InternalMarks');
const Intervention = require('../models/Intervention');
const Achievement = require('../models/Achievement');
const MedicalLeave = require('../models/MedicalLeave');
const AcademicCalendar = require('../models/AcademicCalendar');
const Department = require('../models/Department');
const Subject = require('../models/Subject');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getWorkingDays = (count) => {
  const days = [];
  let d = 0;
  while (days.length < count) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    date.setHours(10, 0, 0, 0);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(new Date(date));
    }
    d++;
  }
  return days.reverse();
};

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping automatic seeding.');
      return;
    }

    console.log('Database is empty. Running automatic comprehensive database seeding...');

    // 1. Seed Departments
    const deptData = [
      { name: 'Computer Engineering', code: 'CE' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Mechanical Engineering', code: 'ME' },
    ];
    const departments = await Department.insertMany(deptData);
    console.log(`${departments.length} Departments Created.`);

    // 2. Seed Subjects
    const subjectData = [
      { name: 'Java Programming', code: 'CE501', department: 'Computer Engineering', semester: 5, credits: 4, type: 'Theory' },
      { name: 'Data Structures & Algorithms', code: 'CE502', department: 'Computer Engineering', semester: 5, credits: 4, type: 'Theory' },
      { name: 'Web Technologies', code: 'CE503', department: 'Computer Engineering', semester: 5, credits: 3, type: 'Theory' },
      { name: 'Database Management Systems', code: 'CE504', department: 'Computer Engineering', semester: 5, credits: 3, type: 'Theory' },
      { name: 'Computer Networks', code: 'CE505', department: 'Computer Engineering', semester: 5, credits: 3, type: 'Theory' },
      
      { name: 'Object Oriented Programming', code: 'CE301', department: 'Computer Engineering', semester: 3, credits: 4, type: 'Theory' },
      { name: 'Digital Logic Design', code: 'CE302', department: 'Computer Engineering', semester: 3, credits: 3, type: 'Theory' },
      { name: 'Discrete Structures', code: 'CE303', department: 'Computer Engineering', semester: 3, credits: 4, type: 'Theory' },
      
      { name: 'Python Programming', code: 'IT501', department: 'Information Technology', semester: 5, credits: 4, type: 'Theory' },
      { name: 'Software Engineering', code: 'IT502', department: 'Information Technology', semester: 5, credits: 3, type: 'Theory' },
      { name: 'Cloud Computing', code: 'IT503', department: 'Information Technology', semester: 5, credits: 3, type: 'Theory' },
      
      { name: 'Thermodynamics', code: 'ME501', department: 'Mechanical Engineering', semester: 5, credits: 4, type: 'Theory' },
      { name: 'Machine Design', code: 'ME502', department: 'Mechanical Engineering', semester: 5, credits: 4, type: 'Theory' },
      { name: 'Manufacturing Processes', code: 'ME503', department: 'Mechanical Engineering', semester: 5, credits: 3, type: 'Theory' },
    ];
    const subjects = await Subject.insertMany(subjectData);
    console.log(`${subjects.length} Subjects Created.`);

    // 3. Seed Users
    const adminUser = await User.create({ email: 'admin@ksv.ac.in', passwordHash: '123456', role: 'admin', isActive: true });
    const hodUser = await User.create({ email: 'hod.ce@ksv.ac.in', passwordHash: '123456', role: 'hod', isActive: true });
    const mentor1User = await User.create({ email: 'priya.shah@ksv.ac.in', passwordHash: '123456', role: 'mentor', isActive: true });
    const mentor2User = await User.create({ email: 'vivek.pandya@ksv.ac.in', passwordHash: '123456', role: 'mentor', isActive: true });
    const fac1User = await User.create({ email: 'amit.desai@ksv.ac.in', passwordHash: '123456', role: 'faculty', isActive: true });
    const fac2User = await User.create({ email: 'sneha.mehta@ksv.ac.in', passwordHash: '123456', role: 'faculty', isActive: true });
    const fac3User = await User.create({ email: 'rajesh.patel@ksv.ac.in', passwordHash: '123456', role: 'faculty', isActive: true });
    const fac4User = await User.create({ email: 'harish.shah@ksv.ac.in', passwordHash: '123456', role: 'faculty', isActive: true });
    const fac5User = await User.create({ email: 'sandeep.sharma@ksv.ac.in', passwordHash: '123456', role: 'faculty', isActive: true });

    // 4. Seed Faculty Profiles
    await Faculty.create({ userId: hodUser._id, firstName: 'Dr. Chirag', lastName: 'Trivedi', employeeId: 'KSV-EMP-001', department: 'Computer Engineering', designation: 'Professor & HOD', isMentor: false, isActive: true });
    await Faculty.create({ userId: mentor1User._id, firstName: 'Priya', lastName: 'Shah', employeeId: 'KSV-EMP-002', department: 'Computer Engineering', designation: 'Assistant Professor', isMentor: true, isActive: true });
    await Faculty.create({ userId: mentor2User._id, firstName: 'Vivek', lastName: 'Pandya', employeeId: 'KSV-EMP-003', department: 'Computer Engineering', designation: 'Assistant Professor', isMentor: true, isActive: true });
    await Faculty.create({ userId: fac1User._id, firstName: 'Amit', lastName: 'Desai', employeeId: 'KSV-EMP-004', department: 'Computer Engineering', designation: 'Assistant Professor', isMentor: false, isActive: true });
    await Faculty.create({ userId: fac2User._id, firstName: 'Sneha', lastName: 'Mehta', employeeId: 'KSV-EMP-005', department: 'Information Technology', designation: 'Assistant Professor', isMentor: false, isActive: true });
    await Faculty.create({ userId: fac3User._id, firstName: 'Rajesh', lastName: 'Patel', employeeId: 'KSV-EMP-006', department: 'Mechanical Engineering', designation: 'Associate Professor', isMentor: false, isActive: true });
    await Faculty.create({ userId: fac4User._id, firstName: 'Harish', lastName: 'Shah', employeeId: 'KSV-EMP-007', department: 'Computer Engineering', designation: 'Assistant Professor', isMentor: false, isActive: true });
    await Faculty.create({ userId: fac5User._id, firstName: 'Sandeep', lastName: 'Sharma', employeeId: 'KSV-EMP-008', department: 'Mechanical Engineering', designation: 'Assistant Professor', isMentor: false, isActive: true });

    console.log('Faculty Profiles created.');

    // 5. Seed Students
    const studentDefs = [
      { email: 'rahul.patel@ksv.ac.in', firstName: 'Rahul', lastName: 'Patel', dept: 'Computer Engineering', sem: 5, div: 'A', enroll: 'KSV2023CE001', mentor: mentor1User._id, risk: { score: 50, level: 'Moderate Risk', reasons: ['Low Attendance (<75%)'] } },
      { email: 'aayushi.joshi@ksv.ac.in', firstName: 'Aayushi', lastName: 'Joshi', dept: 'Computer Engineering', sem: 5, div: 'A', enroll: 'KSV2023CE002', mentor: mentor1User._id, risk: { score: 0, level: 'Safe', reasons: [] } },
      { email: 'meet.shah@ksv.ac.in', firstName: 'Meet', lastName: 'Shah', dept: 'Computer Engineering', sem: 5, div: 'A', enroll: 'KSV2023CE003', mentor: mentor1User._id, risk: { score: 80, level: 'High Risk', reasons: ['Low Attendance (<75%)', 'Low Marks (<40%)', 'CRITICAL: Low Attendance & Low Marks'] } },
      { email: 'nidhi.trivedi@ksv.ac.in', firstName: 'Nidhi', lastName: 'Trivedi', dept: 'Computer Engineering', sem: 5, div: 'A', enroll: 'KSV2023CE004', mentor: mentor1User._id, risk: { score: 0, level: 'Safe', reasons: [] } },
      { email: 'karan.solanki@ksv.ac.in', firstName: 'Karan', lastName: 'Solanki', dept: 'Computer Engineering', sem: 5, div: 'A', enroll: 'KSV2023CE005', mentor: mentor1User._id, risk: { score: 30, level: 'Moderate Risk', reasons: ['Low Marks (<40%)'] } },
      
      { email: 'parth.mehta@ksv.ac.in', firstName: 'Parth', lastName: 'Mehta', dept: 'Computer Engineering', sem: 5, div: 'B', enroll: 'KSV2023CE006', mentor: mentor2User._id, risk: { score: 50, level: 'Moderate Risk', reasons: ['Low Attendance (<75%)'] } },
      { email: 'dharti.vaghela@ksv.ac.in', firstName: 'Dharti', lastName: 'Vaghela', dept: 'Computer Engineering', sem: 5, div: 'B', enroll: 'KSV2023CE007', mentor: mentor2User._id, risk: { score: 0, level: 'Safe', reasons: [] } },
      { email: 'yash.rathod@ksv.ac.in', firstName: 'Yash', lastName: 'Rathod', dept: 'Computer Engineering', sem: 5, div: 'B', enroll: 'KSV2023CE008', mentor: mentor2User._id, risk: { score: 80, level: 'High Risk', reasons: ['Low Attendance (<75%)', 'Low Marks (<40%)', 'CRITICAL: Low Attendance & Low Marks'] } },

      { email: 'tanvi.dave@ksv.ac.in', firstName: 'Tanvi', lastName: 'Dave', dept: 'Computer Engineering', sem: 3, div: 'A', enroll: 'KSV2024CE001', mentor: mentor2User._id, risk: { score: 0, level: 'Safe', reasons: [] } },
      { email: 'harsh.bhatt@ksv.ac.in', firstName: 'Harsh', lastName: 'Bhatt', dept: 'Computer Engineering', sem: 3, div: 'A', enroll: 'KSV2024CE002', mentor: mentor2User._id, risk: { score: 80, level: 'High Risk', reasons: ['Low Attendance (<75%)', 'Low Marks (<40%)', 'CRITICAL: Low Attendance & Low Marks'] } },
      { email: 'poonam.chauhan@ksv.ac.in', firstName: 'Poonam', lastName: 'Chauhan', dept: 'Computer Engineering', sem: 3, div: 'A', enroll: 'KSV2024CE003', mentor: mentor2User._id, risk: { score: 30, level: 'Moderate Risk', reasons: ['Low Marks (<40%)'] } },
      { email: 'nirav.gandhi@ksv.ac.in', firstName: 'Nirav', lastName: 'Gandhi', dept: 'Computer Engineering', sem: 3, div: 'A', enroll: 'KSV2024CE004', mentor: mentor2User._id, risk: { score: 0, level: 'Safe', reasons: [] } },
      { email: 'darshan.vyas@ksv.ac.in', firstName: 'Darshan', lastName: 'Vyas', dept: 'Computer Engineering', sem: 3, div: 'A', enroll: 'KSV2024CE005', mentor: mentor2User._id, risk: { score: 0, level: 'Safe', reasons: [] } },

      { email: 'riya.kapoor@ksv.ac.in', firstName: 'Riya', lastName: 'Kapoor', dept: 'Information Technology', sem: 5, div: 'A', enroll: 'KSV2023IT001', mentor: mentor1User._id, risk: { score: 0, level: 'Safe', reasons: [] } },
      { email: 'dhruv.agarwal@ksv.ac.in', firstName: 'Dhruv', lastName: 'Agarwal', dept: 'Information Technology', sem: 5, div: 'A', enroll: 'KSV2023IT002', mentor: mentor1User._id, risk: { score: 50, level: 'Moderate Risk', reasons: ['Low Attendance (<75%)'] } },
      { email: 'simran.malhotra@ksv.ac.in', firstName: 'Simran', lastName: 'Malhotra', dept: 'Information Technology', sem: 5, div: 'A', enroll: 'KSV2023IT003', mentor: mentor1User._id, risk: { score: 80, level: 'High Risk', reasons: ['Low Attendance (<75%)', 'Low Marks (<40%)', 'CRITICAL: Low Attendance & Low Marks'] } },
      { email: 'preet.thakkar@ksv.ac.in', firstName: 'Preet', lastName: 'Thakkar', dept: 'Information Technology', sem: 5, div: 'A', enroll: 'KSV2023IT004', mentor: mentor1User._id, risk: { score: 0, level: 'Safe', reasons: [] } },
      { email: 'aditya.kumar@ksv.ac.in', firstName: 'Aditya', lastName: 'Kumar', dept: 'Information Technology', sem: 5, div: 'A', enroll: 'KSV2023IT005', mentor: mentor1User._id, risk: { score: 30, level: 'Moderate Risk', reasons: ['Low Marks (<40%)'] } },
      { email: 'nehal.desai@ksv.ac.in', firstName: 'Nehal', lastName: 'Desai', dept: 'Information Technology', sem: 5, div: 'A', enroll: 'KSV2023IT006', mentor: mentor1User._id, risk: { score: 0, level: 'Safe', reasons: [] } },

      { email: 'raj.sharma@ksv.ac.in', firstName: 'Raj', lastName: 'Sharma', dept: 'Mechanical Engineering', sem: 5, div: 'A', enroll: 'KSV2023ME001', mentor: mentor2User._id, risk: { score: 0, level: 'Safe', reasons: [] } },
      { email: 'bhavna.rao@ksv.ac.in', firstName: 'Bhavna', lastName: 'Rao', dept: 'Mechanical Engineering', sem: 5, div: 'A', enroll: 'KSV2023ME002', mentor: mentor2User._id, risk: { score: 80, level: 'High Risk', reasons: ['Low Attendance (<75%)', 'Low Marks (<40%)', 'CRITICAL: Low Attendance & Low Marks'] } },
      { email: 'siddharth.nair@ksv.ac.in', firstName: 'Siddharth', lastName: 'Nair', dept: 'Mechanical Engineering', sem: 5, div: 'A', enroll: 'KSV2023ME003', mentor: mentor2User._id, risk: { score: 50, level: 'Moderate Risk', reasons: ['Low Attendance (<75%)'] } },
      { email: 'prachi.jain@ksv.ac.in', firstName: 'Prachi', lastName: 'Jain', dept: 'Mechanical Engineering', sem: 5, div: 'A', enroll: 'KSV2023ME004', mentor: mentor2User._id, risk: { score: 0, level: 'Safe', reasons: [] } },
      { email: 'akash.mishra@ksv.ac.in', firstName: 'Akash', lastName: 'Mishra', dept: 'Mechanical Engineering', sem: 5, div: 'A', enroll: 'KSV2023ME005', mentor: mentor2User._id, risk: { score: 80, level: 'High Risk', reasons: ['Low Attendance (<75%)', 'Low Marks (<40%)', 'CRITICAL: Low Attendance & Low Marks'] } },
      { email: 'vijay.vaghela@ksv.ac.in', firstName: 'Vijay', lastName: 'Vaghela', dept: 'Mechanical Engineering', sem: 5, div: 'A', enroll: 'KSV2023ME006', mentor: mentor2User._id, risk: { score: 0, level: 'Safe', reasons: [] } },
    ];

    const studentProfiles = [];
    for (const s of studentDefs) {
      const userDoc = await User.create({ email: s.email, passwordHash: '123456', role: 'student', isActive: true });
      const profileDoc = await Student.create({
        userId: userDoc._id,
        enrollmentNumber: s.enroll,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        department: s.dept,
        currentSemester: s.sem,
        division: s.div,
        mentorId: s.mentor,
        parentEmail: `parent.${s.firstName.toLowerCase()}@gmail.com`,
        riskProfile: s.risk,
      });
      studentProfiles.push({ ...s, profileId: profileDoc._id, userId: userDoc._id });
    }
    console.log(`${studentProfiles.length} Student Profiles Created.`);

    // 6. Seed Attendance
    const ce5Subjects  = ['Java Programming', 'Data Structures & Algorithms', 'Web Technologies', 'Database Management Systems', 'Computer Networks'];
    const ce3Subjects  = ['Object Oriented Programming', 'Digital Logic Design', 'Discrete Structures'];
    const it5Subjects  = ['Python Programming', 'Software Engineering', 'Cloud Computing'];
    const me5Subjects  = ['Thermodynamics', 'Machine Design', 'Manufacturing Processes'];

    const subjectFacultyMap = {
      'Java Programming': fac1User._id,
      'Data Structures & Algorithms': fac4User._id,
      'Web Technologies': mentor1User._id,
      'Database Management Systems': mentor2User._id,
      'Computer Networks': fac1User._id,
      'Object Oriented Programming': fac4User._id,
      'Digital Logic Design': mentor1User._id,
      'Discrete Structures': mentor2User._id,
      'Python Programming': fac2User._id,
      'Software Engineering': fac2User._id,
      'Cloud Computing': fac2User._id,
      'Thermodynamics': fac3User._id,
      'Machine Design': fac5User._id,
      'Manufacturing Processes': fac3User._id,
    };

    const attendancePctForRisk = (riskLevel) => {
      if (riskLevel === 'High Risk') return 0.48;
      if (riskLevel === 'Moderate Risk') return 0.68;
      return 0.88;
    };

    const workingDays = getWorkingDays(30);
    const attendanceDocs = [];

    for (const date of workingDays) {
      for (const subj of ce5Subjects.slice(0, 3)) {
        const records = [];
        const ce5Students = studentProfiles.filter(s => s.dept === 'Computer Engineering' && s.sem === 5);
        for (const sp of ce5Students) {
          const attPct = attendancePctForRisk(sp.risk.level);
          records.push({ studentId: sp.profileId, status: Math.random() < attPct ? 'P' : 'A' });
        }
        attendanceDocs.push({ subjectName: subj, facultyId: subjectFacultyMap[subj], date, records });
      }

      for (const subj of ce3Subjects) {
        const records = [];
        const ce3Students = studentProfiles.filter(s => s.dept === 'Computer Engineering' && s.sem === 3);
        for (const sp of ce3Students) {
          const attPct = attendancePctForRisk(sp.risk.level);
          records.push({ studentId: sp.profileId, status: Math.random() < attPct ? 'P' : 'A' });
        }
        attendanceDocs.push({ subjectName: subj, facultyId: subjectFacultyMap[subj], date, records });
      }

      for (const subj of it5Subjects) {
        const records = [];
        const itStudents = studentProfiles.filter(s => s.dept === 'Information Technology');
        for (const sp of itStudents) {
          const attPct = attendancePctForRisk(sp.risk.level);
          records.push({ studentId: sp.profileId, status: Math.random() < attPct ? 'P' : 'A' });
        }
        attendanceDocs.push({ subjectName: subj, facultyId: subjectFacultyMap[subj], date, records });
      }

      for (const subj of me5Subjects) {
        const records = [];
        const meStudents = studentProfiles.filter(s => s.dept === 'Mechanical Engineering');
        for (const sp of meStudents) {
          const attPct = attendancePctForRisk(sp.risk.level);
          records.push({ studentId: sp.profileId, status: Math.random() < attPct ? 'P' : 'A' });
        }
        attendanceDocs.push({ subjectName: subj, facultyId: subjectFacultyMap[subj], date, records });
      }
    }

    await LectureAttendance.insertMany(attendanceDocs);
    console.log(`${attendanceDocs.length} Attendance Records Created.`);

    // 7. Seed Marks
    const examTypes = ['Mid-Sem', 'Quiz', 'Assignment'];
    const marksData = [];
    const subjectsByDept = {
      'Computer Engineering': { 5: ce5Subjects, 3: ce3Subjects },
      'Information Technology': { 5: it5Subjects },
      'Mechanical Engineering': { 5: me5Subjects },
    };

    for (const sp of studentProfiles) {
      const deptSubjects = subjectsByDept[sp.dept]?.[sp.sem] || [];
      for (const subj of deptSubjects.slice(0, 3)) {
        for (const exam of examTypes) {
          let maxM = exam === 'Mid-Sem' ? 30 : 10;
          let baseMin, baseMax;
          if (sp.risk.level === 'High Risk') { baseMin = 0.1; baseMax = 0.38; }
          else if (sp.risk.level === 'Moderate Risk') { baseMin = 0.35; baseMax = 0.65; }
          else { baseMin = 0.60; baseMax = 0.95; }
          const obtained = Math.round((baseMin + Math.random() * (baseMax - baseMin)) * maxM);
          marksData.push({
            studentId: sp.profileId,
            subjectName: subj,
            semester: sp.sem,
            examType: exam,
            marksObtained: Math.max(0, Math.min(obtained, maxM)),
            maxMarks: maxM,
          });
        }
      }
    }
    await InternalMarks.insertMany(marksData);
    console.log(`${marksData.length} Marks Records Created.`);

    // 8. Seed Interventions
    const highRiskStudents = studentProfiles.filter(s => s.risk.level === 'High Risk');
    const moderateRiskStudents = studentProfiles.filter(s => s.risk.level === 'Moderate Risk');
    const interventionDocs = [];

    for (const sp of highRiskStudents) {
      interventionDocs.push({
        studentId: sp.profileId,
        mentorId: sp.mentor,
        type: 'Meeting',
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        status: 'Closed',
        remarks: `Met with ${sp.firstName} regarding low attendance. Student cited difficulties adjusting to early lectures.`,
        actionPlan: 'Advised regular attendance. Student promised to improve.',
        isRead: true,
      });
      interventionDocs.push({
        studentId: sp.profileId,
        mentorId: sp.mentor,
        type: 'Call',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: 'Closed',
        remarks: `Telephonic discussion with parents of ${sp.firstName}. Parents updated about risk status.`,
        actionPlan: 'Parents will monitor attendance and study progress.',
        isRead: true,
      });
      interventionDocs.push({
        studentId: sp.profileId,
        mentorId: sp.mentor,
        type: 'Nudge',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'Open',
        remarks: 'CRITICAL ALERT: Your attendance is below 75% and midterm scores are failing. Please meet your mentor immediately.',
        actionPlan: 'Urgent meeting requested in mentor cabin.',
        isRead: false,
      });
    }

    for (const sp of moderateRiskStudents) {
      interventionDocs.push({
        studentId: sp.profileId,
        mentorId: sp.mentor,
        type: 'Meeting',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        remarks: `Counseling done for ${sp.firstName}. Encouraged student to submit pending assignments and lab manuals.`,
        actionPlan: 'Submit all assignments by upcoming Monday.',
        isRead: false,
      });
    }
    await Intervention.insertMany(interventionDocs);
    console.log(`${interventionDocs.length} Interventions Seeded.`);

    // 9. Seed Achievements
    const safeStudents = studentProfiles.filter(s => s.risk.level === 'Safe');
    const achievementDocs = [];
    const achievementsList = [
      { title: 'Smart India Hackathon 2026 – 1st Place', description: 'Won the first prize in Smart India Hackathon for Smart Irrigation IoT system project.', certificateUrl: 'uploads/achievements/sih2026.pdf' },
      { title: 'NPTEL Gold Medalist – Deep Learning', description: 'Scored 94% in NPTEL Course on Deep Learning, emerging in national top 1%.', certificateUrl: 'uploads/achievements/nptel_dl.pdf' },
      { title: 'ACM ICPC Regional Finalist', description: 'Represented KSV in ACM ICPC Regionals coding competition and secured 45th rank.', certificateUrl: 'uploads/achievements/icpc.pdf' },
      { title: 'Best Technical Paper Award – GTU TechFest', description: 'Presented research on "Autonomous Driving Algorithms using LiDAR" and won best paper award.', certificateUrl: 'uploads/achievements/paper.pdf' },
      { title: 'Google Summer of Code (GSoC) Contributor', description: 'Selected as GSoC developer for Apache Software Foundation project contribution.', certificateUrl: 'uploads/achievements/gsoc.pdf' },
    ];

    safeStudents.slice(0, 5).forEach((sp, i) => {
      achievementDocs.push({
        studentId: sp.profileId,
        title: achievementsList[i].title,
        description: achievementsList[i].description,
        date: new Date(Date.now() - rand(5, 30) * 24 * 60 * 60 * 1000),
        certificateUrl: achievementsList[i].certificateUrl,
        status: i < 3 ? 'approved' : 'pending',
        verifiedBy: i < 3 ? mentor1User._id : undefined,
        remarks: i < 3 ? 'Outstanding achievement verified. Approved.' : undefined,
      });
    });
    await Achievement.insertMany(achievementDocs);
    console.log(`${achievementDocs.length} Achievements Seeded.`);

    // 10. Seed Medical Leaves
    const medicalLeaveDocs = [];
    highRiskStudents.slice(0, 3).forEach((sp, i) => {
      medicalLeaveDocs.push({
        studentId: sp.profileId,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        reason: ['Hospitalization due to Typhoid', 'Severe Migraine and Bed Rest', 'Recovering from Wrist Fracture'][i],
        certificateUrl: `uploads/medical/leave_cert_${sp.enroll}.pdf`,
        status: i === 0 ? 'approved' : i === 1 ? 'pending' : 'rejected',
        mentorRemarks: i === 0 ? 'Approved medical leave with certificate relief' : i === 1 ? 'Awaiting hardcopy submission.' : 'Rejected - invalid certificate period.',
        approvedBy: i === 0 ? mentor1User._id : undefined,
      });
    });
    await MedicalLeave.insertMany(medicalLeaveDocs);
    console.log(`${medicalLeaveDocs.length} Medical Leaves Seeded.`);

    // 11. Seed Calendar Events
    const calendarEvents = [
      { title: 'Odd Semester 2026 Academic Registration', type: 'Event', startDate: new Date('2026-06-15'), endDate: new Date('2026-06-17'), description: 'Enrollment and semester registration for all students.', isPublic: true },
      { title: 'Commencement of Odd Semester Classes', type: 'Event', startDate: new Date('2026-06-22'), endDate: new Date('2026-06-22'), description: 'Official beginning of regular classroom lectures.', isPublic: true },
      { title: 'Independence Day Celebrations', type: 'Holiday', startDate: new Date('2026-08-15'), endDate: new Date('2026-08-15'), description: 'Independence Day Holiday at KSV Gandhinagar campus.', isPublic: true },
      { title: 'Internal Quiz - I', type: 'Exam', startDate: new Date('2026-08-24'), endDate: new Date('2026-08-29'), description: 'Continuous internal assessment (Quiz 1) for all courses.', isPublic: true },
      { title: 'Engineer\'s Day Tech-Exhibit', type: 'Event', startDate: new Date('2026-09-15'), endDate: new Date('2026-09-15'), description: 'Department project exhibition and paper presentation.', isPublic: true },
      { title: 'Mid-Sem Examinations', type: 'Exam', startDate: new Date('2026-09-28'), endDate: new Date('2026-10-06'), description: 'Odd Semester Mid-Sem examinations (30 Marks).', isPublic: true },
      { title: 'Navratri Festive Vacation', type: 'Holiday', startDate: new Date('2026-10-18'), endDate: new Date('2026-10-21'), description: 'Navratri break for GTU/KSV students.', isPublic: true },
      { title: 'Attendance Freeze Date', type: 'Deadline', startDate: new Date('2026-11-10'), endDate: new Date('2026-11-10'), description: 'Final attendance computation for detention criteria.', isPublic: true },
      { title: 'Last Date of Medical Leave Submission', type: 'Deadline', startDate: new Date('2026-11-12'), endDate: new Date('2026-11-12'), description: 'Submit medical certificates for attendance exemption.', isPublic: true },
      { title: 'End-Sem Theory Examinations', type: 'Exam', startDate: new Date('2026-11-23'), endDate: new Date('2026-12-11'), description: 'University final theory examinations.', isPublic: true },
    ];
    await AcademicCalendar.insertMany(calendarEvents);
    console.log(`${calendarEvents.length} Academic Calendar Events Seeded.`);
    console.log('Database auto-seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ksvsmartsystem';
  let memoryServer = null;

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000, // Wait 3s before failing
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedDatabase();
  } catch (error) {
    console.warn(`Local MongoDB connection failed: ${error.message}. Starting in-memory MongoDB server...`);
    try {
      memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      console.log(`In-memory MongoDB started at: ${mongoUri}`);
      
      const conn = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
      await seedDatabase();
    } catch (memError) {
      console.error(`Failed to start/connect to in-memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
