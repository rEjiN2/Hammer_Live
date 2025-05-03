const express=require("express");

const router=express.Router();
const branchController=require("../controllers/branch.controller.js")
const {authenticate} = require('../middleware/authenticat.js')
router.get("/getAllBranch",authenticate,branchController.getAllBranch)
router.post("/createBranch",authenticate,branchController.createBranch)
router.put("/updateBranch",authenticate,branchController.updateBranch)
router.get("/getAllBranchAutocomplete",authenticate,branchController.getAllBranchAutocomplete)
module.exports=router;