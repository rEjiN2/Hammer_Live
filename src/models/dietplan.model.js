const mongoose = require("mongoose");

const dietPlanSchema = new mongoose.Schema({
  customerId: {
    type: String,
    ref: "Customer",
    required: true,
  },
  dietKey: {
    type: String, 
    required: true,
  },
  dietValue: {
    type: String, 
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false, 
  },
  createdBy: {
    type: String, 
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now, 
  },
  lastUpdatedBy: {
    type: String,
    required: false,
  },
  lastUpdatedDate: {
    type: Date,
    default: Date.now, 
  },
});

const DietPlan = mongoose.model("DietPlan", dietPlanSchema);

module.exports = DietPlan;
