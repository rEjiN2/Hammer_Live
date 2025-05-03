const express=require("express");

const router=express.Router();
const trainerController=require("../controllers/trainer.controller.js")
const {authenticate} = require('../middleware/authenticat.js')
router.get("/getAllTrainer",authenticate,trainerController.getAllTrainer)
router.post("/createTrainer",authenticate,trainerController.createTrainer)
router.put("/updateTrainer",authenticate,trainerController.updateTrainer)
module.exports=router;