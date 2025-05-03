const Customer = require('../models/customer.model.js');
const CustomError = require("../utils/CustomError.js");
const { generateCustomerCode } = require("../shared/helper-functions/code-generator.js");

const createCustomer = async (customerData, userData) => {
    try {
        let { branchId, ctr_Name, ctr_Email, ctr_MobileNo, ctr_Addresses, ctr_Dob, ctr_WhatsAppNo, ctr_Height, ctr_Weight, ctr_PaymentPlanId, ctr_CustomPaymentPlanStartDate, ctr_CustomPaymentPlanEndDate } = customerData;
        
        const isFieldExist = await Customer.findOne({
            $or: [
                { ctr_Email: customerData.ctr_Email },
                { ctr_MobileNo: customerData.ctr_MobileNo },
            ]
        });

        if (isFieldExist) {

            if (isFieldExist.ctr_Email === ctr_Email) {
                throw new CustomError("Email already exists", 400);
            } else if (isFieldExist.ctr_MobileNo === ctr_MobileNo) {
                throw new CustomError("Mobile number already exists", 400);
            }
        }

        const code = await generateCustomerCode();

        const customer = await Customer.create({
            branchId,
            ctr_Name,
            ctr_Email,
            ctr_MobileNo,
            ctr_Addresses,
            ctr_Code: code,
            ctr_Dob,
            ctr_WhatsAppNo,
            ctr_Height,
            ctr_Weight,
            ctr_PaymentPlanId,
            ctr_CustomPaymentPlanStartDate,
            ctr_CustomPaymentPlanEndDate,
            createdBy: userData.userId,
            createdDate: new Date(),
            lastUpdatedBy: userData.userId,
            lastUpdatedDate: new Date()
        });

        console.log("Customer ", customer)
        return customer;
    } catch (error) {
        console.log("error - ", error.message)
        throw new Error(error.message)
    }

}


const updateCustomer = async (customerId, updateData) => {
    try {
        // Check if another customer has the same email or mobile number
        const isFieldExist = await Customer.findOne({
            $or: [
                { ctr_Email: updateData.ctr_Email },
                { ctr_MobileNo: updateData.ctr_MobileNo }
            ],
            _id: { $ne: customerId } // Exclude the current customer being updated
        });

        if (isFieldExist) {
            if (isFieldExist.ctr_Email === updateData.ctr_Email) {
                throw new CustomError("Email already exists", 400);
            } else if (isFieldExist.ctr_MobileNo === updateData.ctr_MobileNo) {
                throw new CustomError("Mobile number already exists", 400);
            }
        }

        // Update the customer if no duplicate is found
        const updatedCustomer = await Customer.findByIdAndUpdate(customerId, updateData, { new: true });

        if (!updatedCustomer) {
            throw new CustomError("Customer not found", 400);
        }

        return updatedCustomer;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getAllCustomer = async (query) => {
    try {
        let { pageNo, pageSize } = query;

        pageNo = parseInt(pageNo) || 1;
        pageSize = parseInt(pageSize) || 15;
        const skip = (pageNo - 1) * pageSize;

        // Use projection to limit fields fetched
        var customers = await Customer.find({}, "ctr_Code ctr_Name ctr_Email ctr_MobileNo ctr_Addresses ctr_Dob ctr_WhatsAppNo ctr_Height ctr_Weight ctr_PaymentPlanId ctr_CustomPaymentPlanStartDate ctr_CustomPaymentPlanEndDate branchId")
            .populate({
                path: "branchId",
                select: "bch_Code bch_Name _id", // Avoid redundant `bch_Code`
            })
            .skip(skip)
            .limit(pageSize)
            .lean();  // Use `.lean()` for better performance

        customers = customers.map(({ branchId, ...customer }) => ({    
            ...customer,
            branch: branchId, // Assign populated branch details
            branchId: branchId?._id
        }));

        // Use estimated count for faster results
        const totalCount = await Customer.estimatedDocumentCount();

        return {
            customers,
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
    createCustomer,
    updateCustomer,
    getAllCustomer
}