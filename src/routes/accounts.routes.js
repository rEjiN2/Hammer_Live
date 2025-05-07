const express=require("express");

const router=express.Router();
const accountsController=require("../controllers/accounts.controller.js")
const {authenticate} = require('../middleware/authenticat.js')

router.get("/getAllAccounts", authenticate,accountsController.getAllAccounts);
router.post("/createAccountEntry", authenticate,accountsController.createAccountEntry);
router.put("/updateAccountEntry", authenticate,accountsController.updateAccountEntry);

module.exports=router;