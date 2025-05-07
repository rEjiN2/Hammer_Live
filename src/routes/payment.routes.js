const express=require("express");

const router=express.Router();
const paymentController=require("../controllers/payment.controller.js")
const {authenticate} = require('../middleware/authenticat.js')

router.get("/getAllCustomerPaymentPlans", authenticate,paymentController.getAllCustomerPaymentPlans);
router.post("/createCustomerPaymentPlan", authenticate,paymentController.createCustomerPaymentPlan);
router.put("/updateCustomerPaymentPlan", authenticate,paymentController.updateCustomerPaymentPlan);

module.exports=router;