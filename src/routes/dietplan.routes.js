const express=require("express");

const router=express.Router();
const dietPlanController=require("../controllers/dietplan.controller.js")
const {authenticate} = require('../middleware/authenticat.js')
router.put("/addUpdateDietPlans",authenticate,dietPlanController.addUpdateDietPlans)
module.exports=router;