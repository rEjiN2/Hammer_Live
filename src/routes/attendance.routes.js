const express=require("express");

const router=express.Router();
const attendanceController=require("../controllers/attendance.controller.js")
const {authenticate} = require('../middleware/authenticat.js')
// router.get("/getAllBranch",authenticate,attendanceController.getAllBranch)

router.post("/create",authenticate,attendanceController.createAttendence);
router.get("/get",authenticate,attendanceController.getAttendence);

// router.put("/updateBranch",authenticate,attendanceController.updateBranch)
// router.get("/getAllBranchAutocomplete",authenticate,attendanceController.getAllBranchAutocomplete)
module.exports=router;