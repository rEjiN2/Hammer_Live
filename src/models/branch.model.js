const mongoose = require("mongoose");


const branchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", 
    required: true,
  },
  bch_Code: {
    type: String,
    required: true,
  },
  bch_Name: {
    type: String,
    required: true,
  },
  bch_Password: {
    type: String,
    required: true,
  },
  bch_Email: {
    type: String,
    required: true,
  },
  bch_MobileNo: {
    type: String,
    required: true,
  },
  bch_Location: {
    type: String,
    required: true,
  },
  bch_Addresses: {
    type: String,
    required:true,
  },
  bch_VatNumber: {
    type: String,
    required:true,
  },
  role: {
    type: String,
    default:'2'
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  lastUpdatedDate: {
    type:Date,
    default: Date.now(),
  },
});

const Branch = mongoose.model("branches", branchSchema);

module.exports = Branch;
