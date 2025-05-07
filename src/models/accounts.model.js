const mongoose = require("mongoose");


const accountsSchema = new mongoose.Schema({
  paymentPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomerPaymentPlan", 
    required: false,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer", 
    required: false,
  },
  amount: {
    type: String,
    required: true,
  },
  isCredit: {
    type: Boolean,
    required: false,
  },
  remarks: {
    type: String,
    required: false,
  },
  actionDate: {
    type:Date,
    required: true,
  },
  paymentTypeId: {
    type: String,
    required: true,
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

const Accounts = mongoose.model("Accounts", accountsSchema);

module.exports = Accounts;
