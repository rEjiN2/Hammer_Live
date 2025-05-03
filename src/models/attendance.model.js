const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  CustomerId: {
    type: String,
    required: true,
  },
  CheckinTime: {
    type: Date, 
    required: true,
  },
  CheckOutTime: {
    type: Date,
    required: false, 
  },
  AttendanceDate: {
    type: Date,
    required: true,
  },
  IsDeleted: {
    type: Boolean,
    default: false, 
  },
  CreatedBy: {
    type: String, 
    required: true,
  },
  CreatedDate: {
    type: Date,
    default: Date.now, 
  },
  LastUpdatedBy: {
    type: String,
    required: false,
  },
  LastUpdatedDate: {
    type: Date,
    default: Date.now, 
  },
});

const Attendance = mongoose.model("attendance", attendanceSchema);

module.exports = Attendance;
