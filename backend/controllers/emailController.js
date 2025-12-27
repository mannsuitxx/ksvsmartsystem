const asyncHandler = require('express-async-handler');
const EmailLog = require('../models/EmailLog');
const Student = require('../models/Student');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// @desc    Send email to parent
// @route   POST /api/email/parent
// @access  Private (Mentor/Admin)
const sendParentEmail = asyncHandler(async (req, res) => {
  const { studentId, subject, message } = req.body;
  console.log(`[DEBUG] sendParentEmail request: studentId=${studentId}, subject=${subject}`);

  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  console.log(`[DEBUG] Student found: ${student.firstName}, ParentEmail: ${student.parentEmail}`);

  if (!student.parentEmail) {
    res.status(400);
    throw new Error('Parent email not found for this student');
  }

  try {
    console.log('[DEBUG] Attempting to send email via service...');
    await sendEmail({
      to: student.parentEmail,
      subject: subject,
      htmlContent: `<p>${message}</p>`,
      textContent: message
    });
    console.log('[DEBUG] Email service success.');

    await EmailLog.create({
      senderId: req.user._id,
      recipientEmail: student.parentEmail,
      subject,
      body: message,
      type: 'parent_manual',
      status: 'sent'
    });

    res.status(200).json({ message: 'Email sent to parent successfully' });
  } catch (error) {
    await EmailLog.create({
        senderId: req.user._id,
        recipientEmail: student.parentEmail,
        subject,
        body: message,
        type: 'parent_manual',
        status: 'failed',
        error: error.message
    });
    res.status(500);
    throw new Error(error.message); // Pass the detailed error
  }
});

// @desc    Send email to student
// @route   POST /api/email/student
// @access  Private (Mentor/Admin)
const sendStudentEmail = asyncHandler(async (req, res) => {
  const { studentId, subject, message } = req.body;

  const student = await Student.findById(studentId).populate('userId');
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  const studentEmail = student.userId.email;

  try {
    await sendEmail({
      to: studentEmail,
      subject: subject,
      htmlContent: `<p>${message}</p>`,
      textContent: message
    });

    await EmailLog.create({
      senderId: req.user._id,
      recipientEmail: studentEmail,
      subject,
      body: message,
      type: 'student_manual',
      status: 'sent'
    });

    res.status(200).json({ message: 'Email sent to student successfully' });
  } catch (error) {
    await EmailLog.create({
        senderId: req.user._id,
        recipientEmail: studentEmail,
        subject,
        body: message,
        type: 'student_manual',
        status: 'failed',
        error: error.message
    });
    res.status(500);
    throw new Error(error.message);
  }
});

// @desc    Get email logs
// @route   GET /api/email/logs
// @access  Private (Admin)
const getEmailLogs = asyncHandler(async (req, res) => {
  const logs = await EmailLog.find({}).populate('senderId', 'name email').sort({ createdAt: -1 });
  res.json(logs);
});

module.exports = {
  sendParentEmail,
  sendStudentEmail,
  getEmailLogs
};
