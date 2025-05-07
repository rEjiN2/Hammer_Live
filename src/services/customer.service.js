const Customer = require('../models/customer.model.js');
const DietPlan = require('../models/dietplan.model.js');
const CustomError = require("../utils/CustomError.js");
const paymentService = require("../services/payment.service.js")

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
            // ctr_PaymentPlanId,
            // ctr_CustomPaymentPlanStartDate,
            // ctr_CustomPaymentPlanEndDate,
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
        let { pageNo, pageSize, ctr_Code, ctr_Name, bch_Code, bch_Name, ctr_Email, ctr_MobileNo, ctr_WhatsAppNo, branchId } = query;

        pageNo = parseInt(pageNo) || 1;
        pageSize = parseInt(pageSize) || 15;
        const skip = (pageNo - 1) * pageSize;

        // Build dynamic filters
        const filters = {};

        if (ctr_Code) filters.ctr_Code = { $regex: ctr_Code, $options: 'i' };
        if (ctr_Name) filters.ctr_Name = { $regex: ctr_Name, $options: 'i' };
        if (ctr_Email) filters.ctr_Email = { $regex: ctr_Email, $options: 'i' };
        if (ctr_MobileNo) filters.ctr_MobileNo = { $regex: ctr_MobileNo, $options: 'i' };
        if (ctr_WhatsAppNo) filters.ctr_WhatsAppNo = { $regex: ctr_WhatsAppNo, $options: 'i' };
        if (query.branchId) filters.branchId = query.branchId;

        // Note: bch_Code and bch_Name are in the populated `branchId` object.
        // For filtering them, you'll need to use aggregation OR a `$lookup` approach,
        // but for simplicity here, we filter only base-level fields.

        var customers = await Customer.find(filters, "ctr_Code ctr_Name ctr_Email ctr_MobileNo ctr_Addresses ctr_Dob ctr_WhatsAppNo ctr_Height ctr_Weight ctr_PaymentPlanId ctr_CustomPaymentPlanStartDate ctr_CustomPaymentPlanEndDate branchId")
            .populate({
                path: "branchId",
                select: "bch_Code bch_Name _id",
                match: {
                    ...(bch_Code ? { bch_Code: { $regex: bch_Code, $options: 'i' } } : {}),
                    ...(bch_Name ? { bch_Name: { $regex: bch_Name, $options: 'i' } } : {}),
                }
            })
            .skip(skip)
            .limit(pageSize)
            .lean();

        customers = customers
            .filter(c => c.branchId)  // Filter out null-populated branches due to unmatched `match`
            .map(({ branchId, ...customer }) => ({
                ...customer,
                branch: branchId,
                branchId: branchId?._id
            }));

        const totalCount = await Customer.countDocuments(filters); // Count using same filters

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


const getCustomerDetailsById = async (customerId) => {
    try {
        if (!customerId) {
            throw new Error("Customer ID is required");
        }

        // Fetch customer info with branch details
        const customer = await Customer.findById(customerId,
            "ctr_Code ctr_Name ctr_Email ctr_MobileNo ctr_Addresses ctr_Dob ctr_WhatsAppNo ctr_Height ctr_Weight ctr_PaymentPlanId ctr_CustomPaymentPlanStartDate ctr_CustomPaymentPlanEndDate branchId"
        )
        .populate({
            path: "branchId",
            select: "bch_Code bch_Name _id"
        })
        .lean();

        if (!customer) {
            throw new Error("Customer not found");
        }

        // Format branch info
        customer.branch = customer.branchId;
        customer.branchId = customer.branchId?._id;

        // Fetch all diet plans for the customer (excluding deleted ones)
        const dietPlans = await DietPlan.find(
            { customerId: customerId, isDeleted: { $ne: true } }, // Exclude soft deleted
            "-isDeleted" // Exclude IsDeleted field from response
        ).lean();

        const { paymentPlan } = await paymentService.getCustomerPaymentPlansByCustomerId(customerId);

        return {
            customerInfo: customer,
            customerDietPlan: dietPlans || [],
            paymentPlan: paymentPlan || []
        };
        
    } catch (error) {
        throw new Error(error.message);
    }
};




module.exports = {
    createCustomer,
    updateCustomer,
    getAllCustomer,
    getCustomerDetailsById
}