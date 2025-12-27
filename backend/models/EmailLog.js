const mongoose = require('mongoose');

const emailLogSchema = mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for system generated emails
  },
  recipientEmail: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['parent_manual', 'student_manual', 'monthly_auto'],
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent',
  },
  error: {
    type: String,
  }
}, {
  timestamps: true,
});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

module.exports = EmailLog;
