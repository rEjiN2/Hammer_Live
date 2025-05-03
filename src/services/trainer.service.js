const Trainer = require('../models/trainer.model.js');
const CustomError = require("../utils/CustomError.js");
const { generateTrainerCode } = require("../shared/helper-functions/code-generator.js");

const createTrainer = async (trainerData, userData) => {
    try {
        let { tnr_Name, tnr_Email, tnr_MobileNo, tnr_Addresses, branchId } = trainerData;
        
        const isFieldExist = await Trainer.findOne({
            $or: [
                { tnr_Email: trainerData.tnr_Email },
                { tnr_MobileNo: trainerData.tnr_MobileNo },
            ]
        });

        if (isFieldExist) {

            if (isFieldExist.tnr_Email === tnr_Email) {
                throw new CustomError("Email already exists", 400);
            } else if (isFieldExist.tnr_MobileNo === tnr_MobileNo) {
                throw new CustomError("Mobile number already exists", 400);
            }
        }

        const code = await generateTrainerCode();

        const trainer = await Trainer.create({
            branchId: branchId,
            tnr_Name: tnr_Name,
            tnr_Email: tnr_Email,
            tnr_MobileNo: tnr_MobileNo,
            tnr_Addresses: tnr_Addresses,
            tnr_Code: code,
            createdBy: userData.userId,
            createdDate: new Date(),
            lastUpdatedBy: userData.userId,
            lastUpdatedDate: new Date()
        });

        console.log("Trainer ", trainer)
        return trainer;
    } catch (error) {
        console.log("error - ", error.message)
        throw new Error(error.message)
    }

}


const updateTrainer = async (trainerId, updateData) => {
    try {
        // Check if another trainer has the same email or mobile number
        const isFieldExist = await Trainer.findOne({
            $or: [
                { tnr_Email: updateData.tnr_Email },
                { tnr_MobileNo: updateData.tnr_MobileNo }
            ],
            _id: { $ne: trainerId } // Exclude the current trainer being updated
        });

        if (isFieldExist) {
            if (isFieldExist.tnr_Email === updateData.tnr_Email) {
                throw new CustomError("Email already exists", 400);
            } else if (isFieldExist.tnr_MobileNo === updateData.tnr_MobileNo) {
                throw new CustomError("Mobile number already exists", 400);
            }
        }

        // Update the trainer if no duplicate is found
        const updatedTrainer = await Trainer.findByIdAndUpdate(trainerId, updateData, { new: true });

        if (!updatedTrainer) {
            throw new CustomError("Trainer not found", 400);
        }

        return updatedTrainer;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getAllTrainer = async (query) => {
    try {
        let { pageNo, pageSize } = query;

        pageNo = parseInt(pageNo) || 1;
        pageSize = parseInt(pageSize) || 15;
        const skip = (pageNo - 1) * pageSize;

        // Use projection to limit fields fetched
        var trainers = await Trainer.find({}, "tnr_Code tnr_Name tnr_Email tnr_MobileNo tnr_Addresses branchId")
            .populate({
                path: "branchId",
                select: "bch_Code bch_Name _id", // Avoid redundant `bch_Code`
            })
            .skip(skip)
            .limit(pageSize)
            .lean();  // Use `.lean()` for better performance

        trainers = trainers.map(({ branchId, ...trainer }) => ({    
            ...trainer,
            branch: branchId, // Assign populated branch details
            branchId: branchId?._id
        }));

        // Use estimated count for faster results
        const totalCount = await Trainer.estimatedDocumentCount();

        return {
            trainers,
            pagination: {
                currentPage: pageNo,
                pageSize: pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
                totalCount,
                hasNextPage: pageNo * pageSize < totalCount,
                hasPreviousPage: pageNo > 1,
            }
        };
    } catch (error) {
        throw new Error(error.message);
    }
};


module.exports = {
    createTrainer,
    updateTrainer,
    getAllTrainer
}