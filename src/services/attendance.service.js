const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Attendance = require('../models/attendance.model.js');
const jwtProvider = require("../config/jwtProvider.js");
const CustomError = require("../utils/CustomError.js");
const Customer = require('../models/customer.model.js');



const createAttendence = async (branchData, userData) => {
    try {

        const { CustomerId, CheckinTime, AttendanceDate } = branchData;
        if (!CustomerId || !CheckinTime || !AttendanceDate) {
            throw new CustomError("Missing required fields", 400);
        }
        const attendance = new Attendance({
            CustomerId,
            CheckinTime,
            AttendanceDate,
            IsDeleted: false,
            CreatedBy: userData?.userId,
            CreatedDate: new Date(),
            LastUpdatedBy: userData?.userId,
            LastUpdatedDate: new Date()
        });


        await attendance.save();
        return attendance;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getAttendence = async (req,res) => {
    try {
        const customers = await Customer.aggregate([
            {
                $match: { isDeleted: false }, 
            },
            {
                $lookup: {
                    from: "attendance", 
                    localField: "_id",
                    foreignField: "CustomerId",
                    as: "attendanceData",
                },
            },
            {
                $addFields: {
                    attendanceData: {
                        $filter: {
                            input: "$attendanceData",
                            as: "att",
                            cond: { $eq: ["$$att.IsDeleted", false] }, 
                        },
                    },
                },
            },
            {
                $addFields: {
                    lastCheckIn: {
                        $ifNull: [{ $arrayElemAt: ["$attendanceData.CheckinTime", -1] }, null], // Get latest check-in
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    ctr_Code: 1,
                    ctr_Name: 1,
                    ctr_Email: 1,
                    ctr_MobileNo: 1,
                    lastCheckIn: 1,
                },
            },
        ]);

        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}




module.exports = {
    createAttendence,
    getAttendence

}