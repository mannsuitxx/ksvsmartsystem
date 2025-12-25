const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty' // Points to a Faculty profile
  },
  totalIntake: {
    type: Number,
    default: 60
  }
}, {
  timestamps: true,
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
