const mongoose = require("mongoose");


const customerSchema = new mongoose.Schema({
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "branches", 
    required: true,
  },
  ctr_Code: {
    type: String,
    required: true,
  },
  ctr_Name: {
    type: String,
    required: true,
  },
  ctr_Email: {
    type: String,
    required: true,
  },
  ctr_MobileNo: {
    type: String,
    required: true,
  },
  ctr_Addresses: {
    type: String,
    required:true,
  },
  ctr_Dob: {
    type: String,
    required:true,
  },
  ctr_WhatsAppNo: {
    type: String,
    required: true,
  },
  ctr_Height: {
    type: String,
    required: true,
  },
  ctr_Weight: {
    type: String,
    required: true,
  },
  ctr_PaymentPlanId: {
    type: String,
    required: true,
  },
  ctr_CustomPaymentPlanStartDate: {
    type: Date,
  },
  ctr_CustomPaymentPlanEndDate: {
    type: Date,
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

const Customer = mongoose.model("customer", customerSchema);

module.exports = Customer;
