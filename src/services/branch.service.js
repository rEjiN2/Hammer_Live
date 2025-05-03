const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Branch = require('../models/branch.model.js');
const jwtProvider = require("../config/jwtProvider");
const CustomError = require("../utils/CustomError.js");
const { generateBranchCode } = require("../shared/helper-functions/code-generator.js");

const createBranch = async (branchData, userData) => {
    try {
        console.log(userData, 'this is userdatakkkkk')

        let { bch_Name, bch_Email, bch_Password, bch_MobileNo, bch_Location, bch_Addresses, bch_VatNumber } = branchData;
        
        const isFieldExist = await Branch.findOne({
            $or: [
                { bch_Email: branchData.bch_Email },
                { bch_MobileNo: branchData.bch_MobileNo },
            ]
        });

        if (isFieldExist) {

            if (isFieldExist.bch_Email === bch_Email) {
                throw new CustomError("Email already exists", 400);
            } else if (isFieldExist.bch_MobileNo === bch_MobileNo) {
                throw new CustomError("Mobile number already exists", 400);
            }
        }

        const code = await generateBranchCode();

        password = await bcrypt.hash(bch_Password, 8);

        const branch = await Branch.create({
            userId: userData.userId, 
            bch_Name: bch_Name,
            bch_Email: bch_Email,
            bch_Password: password,
            bch_MobileNo: bch_MobileNo, 
            bch_Location: bch_Location,
            bch_Addresses: bch_Addresses,
            bch_VatNumber: bch_VatNumber,
            bch_Code: code, createdBy: userData.userId,
            createdDate: new Date(),
        })

        console.log("branch ", branch)
        return branch;
    } catch (error) {
        console.log("error - ", error.message)
        throw new Error(error.message)
    }

}


const updateBranch = async (branchId, updateData) => {

    try {
        // Check if another branch has the same email or mobile number
        const isFieldExist = await Branch.findOne({
            $or: [
                { bch_Email: updateData.bch_Email },
                { bch_MobileNo: updateData.bch_MobileNo }
            ],
            _id: { $ne: branchId } // Exclude the current branch being updated
        });

        if (isFieldExist) {
            if (isFieldExist.bch_Email === updateData.bch_Email) {
                throw new CustomError("Email already exists", 400);
            } else if (isFieldExist.bch_MobileNo === updateData.bch_MobileNo) {
                throw new CustomError("Mobile number already exists", 400);
            }
        }
        const updatedBranch = await Branch.findByIdAndUpdate(branchId, updateData, { new: true });
        if (!updatedBranch) {
            throw new CustomError("Branch not found", 400);
        }
        return updatedBranch
    } catch (error) {
        throw new Error(error.message, 500);
    }
}

const findBranchById = async (branchId) => {
    try {
        const branch = await Branch.findById(branchId);
        if (!branch) {
            throw new Error("branch not found with id : ", branchId)
        }
        return branch;
    } catch (error) {
        console.log("error :------- ", error.message)
        throw new Error(error.message)
    }
}

const getBranchByEmail = async (email) => {
    try {

        const branch = await Branch.findOne({ email });

        if (!branch) {
            throw new Error("branch found with email : ", email)
        }

        return branch;

    } catch (error) {
        console.log("error - ", error.message)
        throw new Error(error.message)
    }
}

const getBranchById = async (branchId) => {
    try {
        console.log("branch id ", branchId)

        const branch = (await findBranchById(branchId));
        branch.bch_Password = null;

        if (!branch) {
            throw new Error("branch not exist with id : ", branchId)
        }
        return branch;
    } catch (error) {
        console.log("error ----- ", error.message)
        throw new Error(error.message)
    }
}

const getAllBranchs = async () => {
    try {
        const branchs = await Branch.find();
        return branchs;
    } catch (error) {
        console.log("error - ", error)
        throw new Error(error.message)
    }
}

module.exports = {
    createBranch,
    findBranchById,
    getBranchById,
    getBranchByEmail,
    getAllBranchs,
    updateBranch
}