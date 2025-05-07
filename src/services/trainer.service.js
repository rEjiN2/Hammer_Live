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
        let { pageNo, pageSize, tnr_MobileNo, tnr_Email, tnr_Name, tnr_Code, branchId, bch_Code } = query;

        pageNo = parseInt(pageNo) || 1;
        pageSize = parseInt(pageSize) || 15;
        const skip = (pageNo - 1) * pageSize;

        // Build filters
        const filters = {};
        if (tnr_MobileNo) filters.tnr_MobileNo = { $regex: tnr_MobileNo, $options: 'i' };
        if (tnr_Email) filters.tnr_Email = { $regex: tnr_Email, $options: 'i' };
        if (tnr_Name) filters.tnr_Name = { $regex: tnr_Name, $options: 'i' };
        if (tnr_Code) filters.tnr_Code = { $regex: tnr_Code, $options: 'i' };
        if (branchId) filters.branchId = branchId;

        // Fetch trainers with filters and pagination
        var trainers = await Trainer.find(filters, "tnr_Code tnr_Name tnr_Email tnr_MobileNo tnr_Addresses branchId")
            .populate({
                path: "branchId",
                select: "bch_Code bch_Name _id",
                match: {
                    ...(bch_Code ? { bch_Code: { $regex: bch_Code, $options: 'i' } } : {})
                }
            })
            .skip(skip)
            .limit(pageSize)
            .lean();

        // Filter out unmatched populated branches
        trainers = trainers
            .filter(t => t.branchId) 
            .map(({ branchId, ...trainer }) => ({
                ...trainer,
                branch: branchId,
                branchId: branchId?._id
            }));

        const totalCount = await Trainer.countDocuments(filters);

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