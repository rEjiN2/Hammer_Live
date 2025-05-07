const express=require("express");

const router=express.Router();
const customerController=require("../controllers/customer.controller.js")
const {authenticate} = require('../middleware/authenticat.js')
router.get("/getCustomerDetailsById",authenticate,customerController.getCustomerDetailsById)
router.get("/getAllCustomer",authenticate,customerController.getAllCustomer)
router.post("/createCustomer",authenticate,customerController.createCustomer)
router.put("/updateCustomer",authenticate,customerController.updateCustomer)
module.exports=router;