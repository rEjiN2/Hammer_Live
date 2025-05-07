const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Attendance = require('../models/attendance.model.js');
const jwtProvider = require("../config/jwtProvider.js");
const CustomError = require("../utils/CustomError.js");
const Customer = require('../models/customer.model.js');



const checkIn = async (branchData, userData) => {
    try {
        const { customerId, checkinTime, attendanceDate } = branchData;
        
        if (!customerId || !checkinTime || !attendanceDate) {
            throw new CustomError("Missing required fields", 400);
        }

        // Check for existing check-in on the same date
        const existingCheckIn = await Attendance.findOne({
            customerId,
            attendanceDate,
            isDeleted: false
        });

        if (existingCheckIn) {
            return { message: "You are already checked in today" };
        }

        const attendance = new Attendance({
            customerId,
            checkinTime,
            attendanceDate,
            isDeleted: false,
            createdBy: userData?.userId,
            createdDate: new Date(),
            lastUpdatedBy: userData?.userId,
            lastUpdatedDate: new Date()
        });

        await attendance.save();
        return attendance;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// const getAllAttendance = async (selectedDate) => {
//     // const selectedDate = req.query.AttendanceDate;

//     try {
//         // Get all customers
//         const customers = await Customer.find({}, "ctr_Code ctr_Name branchId");

//         // Get all attendance for the selected date (only check-ins)
//         const attendanceRecords = await Attendance.find({
//             attendanceDate: selectedDate,
//             isDeleted: false
//         }, "customerId checkinTime attendanceDate");

//         // Create a map of customerId to attendance record
//         const attendanceMap = new Map();
//         attendanceRecords.forEach(record => {
//             attendanceMap.set(record.customerId.toString(), record);
//         });

//         // Merge attendance data into customer records
//         const result = customers.map(customer => {
//             const customerIdStr = customer._id ? customer._id.toString() : null;
//             const attendance = attendanceMap.get(customerIdStr);
//             return {
//                 customerId: customer._id,
//                 ctr_Code: customer.ctr_Code,
//                 ctr_Name: customer.ctr_Name,
//                 branchId: customer.branchId,
//                 attendanceId: attendance ? attendance._id : null,
//                 checkinTime: attendance ? attendance.checkinTime : null,
//                 attendanceDate: attendance ? attendance.attendanceDate : null,
//                 isPresent: !!attendance,
//                 _id: attendance?._id
//             };
//         });

//         // res.json(result);
//         return result;
//     } catch (error) {
//         console.error("Error fetching attendance:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };


const getAllAttendance = async (selectedDate, query) => {
    try {
        let { pageNo, pageSize, branchId, bch_Code, ctr_Name, ctr_Code, isPresent, ctr_MobileNo, ctr_WhatsAppNo } = query;

        pageNo = parseInt(pageNo) || 1;
        pageSize = parseInt(pageSize) || 15;
        const skip = (pageNo - 1) * pageSize;

        // Get all customers with extra fields
        const customers = await Customer.find({}, "ctr_Code ctr_Name ctr_MobileNo ctr_WhatsAppNo branchId")
            .populate({
                path: "branchId",
                select: "bch_Code bch_Name _id",
                match: {
                    ...(bch_Code ? { bch_Code: { $regex: bch_Code, $options: 'i' } } : {})
                }
            });

        // Get all attendance for the selected date (only check-ins)
        const attendanceRecords = await Attendance.find({
            attendanceDate: selectedDate,
            isDeleted: false
        }, "customerId checkinTime attendanceDate");

        // Create a map of customerId to attendance record
        const attendanceMap = new Map();
        attendanceRecords.forEach(record => {
            attendanceMap.set(record.customerId.toString(), record);
        });

        // Merge attendance data into customer records
        let result = customers.map(customer => {
            const customerIdStr = customer._id ? customer._id.toString() : null;
            const attendance = attendanceMap.get(customerIdStr);
            return {
                customerId: customer._id,
                ctr_Code: customer.ctr_Code,
                ctr_Name: customer.ctr_Name,
                ctr_MobileNo: customer.ctr_MobileNo,
                ctr_WhatsAppNo: customer.ctr_WhatsAppNo,
                branchId: customer.branchId?._id,
                bch_Code: customer.branchId?.bch_Code || null,
                attendanceId: attendance ? attendance._id : null,
                checkinTime: attendance ? attendance.checkinTime : null,
                attendanceDate: attendance ? attendance.attendanceDate : null,
                isPresent: !!attendance,
                _id: attendance?._id
            };
        });

        // Apply filters
        result = result.filter(item => {
            const matchBranchId = branchId ? item.branchId?.toString() === branchId : true;
            const matchCtr_Name = ctr_Name ? item.ctr_Name?.toLowerCase().includes(ctr_Name.toLowerCase()) : true;
            const matchCtr_Code = ctr_Code ? item.ctr_Code?.toLowerCase().includes(ctr_Code.toLowerCase()) : true;
            const matchMobile = ctr_MobileNo ? item.ctr_MobileNo?.toLowerCase().includes(ctr_MobileNo.toLowerCase()) : true;
            const matchWhatsApp = ctr_WhatsAppNo ? item.ctr_WhatsAppNo?.toLowerCase().includes(ctr_WhatsAppNo.toLowerCase()) : true;
            const matchIsPresent = isPresent !== undefined ? item.isPresent === (isPresent === 'true') : true;
            return matchBranchId && matchCtr_Name && matchCtr_Code && matchMobile && matchWhatsApp && matchIsPresent;
        });

        const paginatedResult = result.slice(skip, skip + pageSize);

        return {
            attendance: paginatedResult,
            pagination: {
                currentPage: pageNo,
                pageSize: pageSize,
                totalPages: Math.ceil(result.length / pageSize),
                totalCount: result.length,
                hasNextPage: pageNo * pageSize < result.length,
                hasPreviousPage: pageNo > 1,
            }
        };
    } catch (error) {
        console.error("Error fetching attendance:", error);
        throw new Error("Internal server error");
    }
};




module.exports = {
    checkIn,
    getAllAttendance

}