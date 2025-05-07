const mongoose = require("mongoose");


const customerPaymentPlanSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer", 
    required: true,
  },
  paymentPlanId: {
    type: String,
    required: true,
  },
  payableAmount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    required: true,
  },
  planStartDate: {
    type:Date,
    required: true,
  },
  planEndDate: {
    type:Date,
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

const CustomerPaymentPlan = mongoose.model("CustomerPaymentPlan", customerPaymentPlanSchema);

module.exports = CustomerPaymentPlan;
