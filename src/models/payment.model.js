const mongoose = require("mongoose");


const paymentSchema = new mongoose.Schema({
  customerPaymentPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomerPaymentPlan", 
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  paymentDate: {
    type:Date,
    required: true,
  },
  paymentMethod: {
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

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
