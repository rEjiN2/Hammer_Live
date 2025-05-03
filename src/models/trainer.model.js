const mongoose = require("mongoose");


const trainerSchema = new mongoose.Schema({
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "branches", 
    required: true,
  },
  tnr_Code: {
    type: String,
    required: true,
  },
  tnr_Name: {
    type: String,
    required: true,
  },
  tnr_Email: {
    type: String,
    required: true,
  },
  tnr_MobileNo: {
    type: String,
    required: true,
  },
  tnr_Addresses: {
    type: String,
    required:true,
  },
  isDeleted: {
    type: Boolean,
    default:false
  },
  createdBy:{
    type:String,
    required:true
  },
  createdDate:{
    type:Date,
    default: Date.now(),
  },
  lastUpdatedBy: {
    type:String,
    require:false
  },
  lastUpdatedDate: {
    type:Date,
    default: Date.now(),
  },
});

const Trainer = mongoose.model("trainers", trainerSchema);

module.exports = Trainer;
