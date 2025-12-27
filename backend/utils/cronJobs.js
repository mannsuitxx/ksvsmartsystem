const cron = require('node-cron');
const Student = require('../models/Student');
const LectureAttendance = require('../models/LectureAttendance');
const InternalMarks = require('../models/InternalMarks');
const { sendEmail } = require('./emailService');
const EmailLog = require('../models/EmailLog');

const generateMonthlyReports = async () => {
    console.log('Running Monthly Student Statistics Job...');
    let count = 0;
    
    try {
        const students = await Student.find({}).populate('userId'); 

        for (const student of students) {
            if (student.parentEmail) {
                // Calculate Attendance
                const attendanceRecords = await LectureAttendance.find({ "records.studentId": student._id });
                let totalLectures = 0;
                let presentLectures = 0;
                
                attendanceRecords.forEach(record => {
                    const studentRecord = record.records.find(r => r.studentId.toString() === student._id.toString());
                    if (studentRecord) {
                        totalLectures++;
                        if (studentRecord.status === 'P') presentLectures++;
                    }
                });

                const attendancePercentage = totalLectures > 0 ? ((presentLectures / totalLectures) * 100).toFixed(2) : 0;

                // Calculate Marks
                const marksRecords = await InternalMarks.find({ studentId: student._id });
                let totalObtained = 0;
                let totalMax = 0;
                marksRecords.forEach(mark => {
                    totalObtained += mark.marksObtained;
                    totalMax += mark.maxMarks;
                });
                
                const marksPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;

                const message = `
                    <h1>Monthly Student Academic Report</h1>
                    <p>Dear Parent,</p>
                    <p>Here is the monthly academic report for your ward <strong>${student.firstName} ${student.lastName}</strong>.</p>
                    <ul>
                        <li><strong>Attendance:</strong> ${attendancePercentage}%</li>
                        <li><strong>Internal Marks Average:</strong> ${marksPercentage}%</li>
                        <li><strong>Risk Level:</strong> ${student.riskProfile?.level || 'N/A'}</li>
                    </ul>
                    <p>Please contact the mentor if you have any concerns.</p>
                    <p>KSV Smart System</p>
                `;

                try {
                    await sendEmail({
                        to: student.parentEmail,
                        subject: `Monthly Academic Report - ${student.firstName} ${student.lastName}`,
                        htmlContent: message,
                        textContent: `Monthly Academic Report for ${student.firstName} ${student.lastName}. Attendance: ${attendancePercentage}%. Marks: ${marksPercentage}%.`
                    });

                    // Log the email
                    await EmailLog.create({
                        recipientEmail: student.parentEmail,
                        subject: `Monthly Academic Report - ${student.firstName} ${student.lastName}`,
                        body: `Monthly Academic Report for ${student.firstName} ${student.lastName}. Attendance: ${attendancePercentage}%. Marks: ${marksPercentage}%.`,
                        type: 'monthly_auto',
                        status: 'sent'
                    });

                    console.log(`Report sent to ${student.parentEmail}`);
                    count++;

                } catch (err) {
                    console.error(`Failed to send report to ${student.parentEmail}:`, err);
                    await EmailLog.create({
                        recipientEmail: student.parentEmail,
                        subject: `Monthly Academic Report - ${student.firstName} ${student.lastName}`,
                        body: 'Failed to send',
                        type: 'monthly_auto',
                        status: 'failed',
                        error: err.message
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error in monthly cron job:', error);
    }
    return count;
};

const setupCronJobs = () => {
  // Run at 00:00 on the 1st day of every month
  cron.schedule('0 0 1 * *', () => {
      generateMonthlyReports();
  });
};

module.exports = { setupCronJobs, generateMonthlyReports };
