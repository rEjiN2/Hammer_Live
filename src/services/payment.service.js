const CustomerPaymentPlan = require('../models/customerPaymentPlan.model.js');
const Payment = require('../models/payment.model.js');
const Accounts = require('../models/accounts.model.js');
const CustomError = require("../utils/CustomError.js");
const {paymentPlanMaster} = require("../shared/master-datas/payment-plans.js")


const getAllCustomerPaymentPlans = async (query) => {
    try {
        let { pageNo, pageSize, ctr_Code, ctr_MobileNo, ctr_WhatsAppNo, ctr_Name, paymentPlanId, planStartDateFrom, planStartDateTo, planEndDateFrom, planEndDateTo, paymentStatus } = query;

        pageNo = parseInt(pageNo) || 1;
        pageSize = parseInt(pageSize) || 15;
        const skip = (pageNo - 1) * pageSize;

        // Step 1: Get latest plan per customer (paginated)
        const customerPlans = await CustomerPaymentPlan.aggregate([
            { $sort: { createdDate: -1 } },
            {
                $group: {
                    _id: "$customerId",
                    latestPlan: { $first: "$$ROOT" }
                }
            },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: "customers",
                    localField: "latestPlan.customerId",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            { $unwind: "$customer" },
            {
                $project: {
                    customer: {
                        _id: "$customer._id",
                        ctr_Name: "$customer.ctr_Name",
                        ctr_MobileNo: "$customer.ctr_MobileNo",
                        ctr_WhatsAppNo: "$customer.ctr_WhatsAppNo",
                        ctr_Code: "$customer.ctr_Code"
                    },
                    paymentPlanId: "$latestPlan.paymentPlanId",
                    payableAmount: "$latestPlan.payableAmount",
                    paidAmount: "$latestPlan.paidAmount",
                    planStartDate: "$latestPlan.planStartDate",
                    planEndDate: "$latestPlan.planEndDate",
                    planId: "$latestPlan._id"
                }
            }
        ]);

        // Step 2: Extract plan IDs
        const planIds = customerPlans.map(p => p.planId);

        // Step 3: Get all payments for the fetched plans
        const allPayments = await Payment.find({
            customerPaymentPlanId: { $in: planIds }
        }).lean();

        // Step 4: Group payments by planId
        const paymentsMap = {};
        allPayments.forEach(payment => {
            const planId = payment.customerPaymentPlanId.toString();
            if (!paymentsMap[planId]) paymentsMap[planId] = [];
            paymentsMap[planId].push(payment);
        });

        // Step 5: Attach all payments and apply filters
        let result = customerPlans.map(plan => {
            const paymentStatus = plan.payableAmount > plan.paidAmount ? 'Pending' : 'Completed';
            return {
                customer: plan.customer,
                payments: paymentsMap[plan.planId.toString()] || [],
                paidAmount: plan.paidAmount,
                payableAmount: plan.payableAmount,
                paymentPlanId: plan.paymentPlanId,
                planStartDate: plan.planStartDate,
                planEndDate: plan.planEndDate,
                _id: plan.planId,
                paymentStatus
            };
        });

        // Apply filters on result
        result = result.filter(item => {
            const matchCtr_Code = ctr_Code ? item.customer.ctr_Code?.toLowerCase().includes(ctr_Code.toLowerCase()) : true;
            const matchCtr_Name = ctr_Name ? item.customer.ctr_Name?.toLowerCase().includes(ctr_Name.toLowerCase()) : true;
            const matchCtr_MobileNo = ctr_MobileNo ? item.customer.ctr_MobileNo?.toLowerCase().includes(ctr_MobileNo.toLowerCase()) : true;
            const matchCtr_WhatsAppNo = ctr_WhatsAppNo ? item.customer.ctr_WhatsAppNo?.toLowerCase().includes(ctr_WhatsAppNo.toLowerCase()) : true;
            const matchPlanId = paymentPlanId ? item.paymentPlanId?.toString() === paymentPlanId : true;

            const normalizeDate = (date) => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                return d;
            };
            
            const matchPlanStart = (() => {
                const start = planStartDateFrom ? normalizeDate(planStartDateFrom) : null;
                const end = planStartDateTo ? normalizeDate(planStartDateTo) : null;
                const itemDate = normalizeDate(item.planStartDate);
            
                if (!start && !end) return true;
                if (start && end) return itemDate >= start && itemDate <= end;
                if (start && !end) return itemDate.getTime() === start.getTime(); // exact match
                if (!start && end) return itemDate <= end;
            })();
            
            const matchPlanEnd = (() => {
                const start = planEndDateFrom ? normalizeDate(planEndDateFrom) : null;
                const end = planEndDateTo ? normalizeDate(planEndDateTo) : null;
                const itemDate = normalizeDate(item.planEndDate);
            
                if (!start && !end) return true;
                if (start && end) return itemDate >= start && itemDate <= end;
                if (start && !end) return itemDate.getTime() === start.getTime(); // exact match
                if (!start && end) return itemDate <= end;
            })();
            

            const matchStatus = paymentStatus ? item.paymentStatus === paymentStatus : true;

            return matchCtr_Code && matchCtr_Name && matchCtr_MobileNo && matchCtr_WhatsAppNo && matchPlanId && matchPlanStart && matchPlanEnd && matchStatus;
        });

        // Step 6: Total unique customers count (not affected by filters)
        const totalCountResult = await CustomerPaymentPlan.aggregate([
            { $group: { _id: "$customerId" } },
            { $count: "count" }
        ]);
        const totalCount = totalCountResult[0]?.count || 0;

        return {
            data: result,
            pagination: {
                currentPage: pageNo,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
                totalCount,
                hasNextPage: pageNo * pageSize < totalCount,
                hasPreviousPage: pageNo > 1,
            }
        };
    } catch (error) {
        console.error("Error in getAllCustomerPaymentPlans:", error.message);
        throw new Error(error.message);
    }
};




const getCustomerPaymentPlansByCustomerId = async (customerId) => {
    try {
        if (!customerId) {
            throw new Error("Customer ID is required.");
        }

        // Fetch payment plans for the specific customer, sorted by createdAt descending
        const customerPlans = await CustomerPaymentPlan.find({ customerId })
            .sort({ createdDate: -1 }) // Sort by createdAt in descending order
            .select("customerId paymentPlanId payableAmount paidAmount planStartDate planEndDate") // Select only required fields
            .populate({
                path: "customerId",
                select: "ctr_Name ctr_Email ctr_MobileNo _id"
            })
            .lean();

        if (customerPlans.length === 0) {
            return {
                data: [],
                message: "No payment plans found for the given customer ID.",
            };
        }

        // Get all plan IDs to fetch payments
        const planIds = customerPlans.map(plan => plan._id);

        const payments = await Payment.find({ customerPaymentPlanId: { $in: planIds } })
            .select("customerPaymentPlanId amount paymentDate paymentMethod")
            .lean();

        // Group payments by plan ID
        const paymentsMap = {};
        payments.forEach(payment => {
            const planId = payment.customerPaymentPlanId.toString();
            if (!paymentsMap[planId]) paymentsMap[planId] = [];
            paymentsMap[planId].push(payment);
        });

        // Combine payments with plans
        const result = customerPlans.map(plan => {
            const updatedPlan = {
                ...plan,
                customer: plan.customerId,
                payments: paymentsMap[plan._id.toString()] || []
            };
            delete updatedPlan.customerId;
            return updatedPlan;
        });

        return {
            paymentPlan: result,
        };
    } catch (error) {
        console.error("Error in getCustomerPaymentPlansByCustomerId:", error.message);
        throw new Error(error.message);
    }
};




const createCustomerPaymentPlan = async (customerPaymentPlanData, userData) => {
    try {
        let { customerId, paymentPlanId, payableAmount, paidAmount, paymentMethod, planStartDate, planEndDate } = customerPaymentPlanData;

        // Get payment plan from master
        const paymentPlan = paymentPlanMaster?.find((x) => x._id == paymentPlanId);
        if (!paymentPlan) {
            throw new Error("Invalid payment plan ID");
        }

        if(paymentPlanId != '4'){
            // Start date = today
            planStartDate = new Date();
    
            // End date = start date + duration (in days)
            planEndDate = new Date(planStartDate);
            planEndDate.setDate(planEndDate.getDate() + paymentPlan.duration);
        }

        // Create Customer Payment Plan
        const customerPaymentPlan = await CustomerPaymentPlan.create({
            customerId,
            paymentPlanId,
            payableAmount,
            paidAmount,
            planStartDate,
            planEndDate,
            createdBy: userData.userId,
            createdDate: new Date(),
            lastUpdatedBy: userData.userId,
            lastUpdatedDate: new Date()
        });

        // Create Payment
        const payment = await createNewPayment(customerPaymentPlan, paidAmount, paymentMethod, userData, customerId, "New plan activated");

        // const payment = await Payment.create({
        //     customerPaymentPlanId: customerPaymentPlan._id,
        //     amount: paidAmount, // Assuming full amount is paid now
        //     paymentDate: new Date(),
        //     paymentMethod,
        //     createdBy: userData.userId,
        //     createdDate: new Date(),
        //     lastUpdatedBy: userData.userId,
        //     lastUpdatedDate: new Date()
        // });

        // Return selected fields
        return {
            customerPaymentPlan: {
                _id: customerPaymentPlan._id,
                customerId: customerPaymentPlan.customerId,
                paymentPlanId: customerPaymentPlan.paymentPlanId,
                payableAmount: customerPaymentPlan.payableAmount,
                paidAmount: customerPaymentPlan.paidAmount,
                planStartDate: customerPaymentPlan.planStartDate,
                planEndDate: customerPaymentPlan.planEndDate,
                payments: [{
                    _id: payment._id,
                    amount: payment.amount,
                    paymentDate: payment.paymentDate,
                    paymentMethod: payment.paymentMethod
                }]
            }
        };
    } catch (error) {
        console.error("Error -", error.message);
        throw new Error(error.message);
    }
};

const updateCustomerPaymentPlan = async (customerPaymentPlanId, updateData, userData) => {
    try {
        const { payBalanceAmount, payBalancePaymentMethod, customerId } = updateData;

        // Validate inputs
        if (!payBalanceAmount || !payBalancePaymentMethod) {
            throw new Error("payBalanceAmount and paymentMethod are required.");
        }

        // Find existing payment plan
        const existingPlan = await CustomerPaymentPlan.findById(customerPaymentPlanId);
        if (!existingPlan) {
            throw new Error("CustomerPaymentPlan not found.");
        }

        let paidAmount = Number(existingPlan.paidAmount);
        // Update the paidAmount
        existingPlan.paidAmount = paidAmount + payBalanceAmount;
        existingPlan.lastUpdatedBy = userData.userId;
        existingPlan.lastUpdatedDate = new Date();

        // Save updated plan
        await existingPlan.save();

        // Create new payment entry
        const newPayment = await createNewPayment(existingPlan, payBalanceAmount, payBalancePaymentMethod, userData, customerId, "Balance Payment");
        // const newPayment = await Payment.create({
        //     customerPaymentPlanId: existingPlan._id,
        //     amount: payBalanceAmount,
        //     paymentDate: new Date(),
        //     paymentMethod: payBalancePaymentMethod,
        //     createdBy: userData.userId,
        //     createdDate: new Date(),
        //     lastUpdatedBy: userData.userId,
        //     lastUpdatedDate: new Date()
        // });

        // Return updated payment plan summary
        return {
            message: "Customer payment plan updated successfully",
            customerPaymentPlan: {
                _id: existingPlan._id,
                customerId: existingPlan.customerId,
                paymentPlanId: existingPlan.paymentPlanId,
                payableAmount: existingPlan.payableAmount,
                paidAmount: existingPlan.paidAmount,
                planStartDate: existingPlan.planStartDate,
                planEndDate: existingPlan.planEndDate,
                newPayment: {
                    _id: newPayment._id,
                    amount: newPayment.amount,
                    paymentDate: newPayment.paymentDate,
                    paymentMethod: newPayment.paymentMethod
                }
            }
        };
    } catch (error) {
        console.error("Error -", error.message);
        throw new Error(error.message);
    }
};

const createNewPayment = async (existingPlan, amount, paymentMethod, userData, customerId, remarks) => {
        const newPayment = await Payment.create({
            customerPaymentPlanId: existingPlan._id,
            amount: amount,
            paymentDate: new Date(),
            paymentMethod: paymentMethod,
            createdBy: userData.userId,
            createdDate: new Date(),
            lastUpdatedBy: userData.userId,
            lastUpdatedDate: new Date()
        });
        Accounts.create({
            paymentPlanId: existingPlan._id,
            customerId: customerId,
            amount: amount,
            actionDate: new Date(),
            remarks: remarks,
            paymentTypeId: '1',
            createdBy: userData.userId,
            isCredit: true,
            createdDate: new Date(),
            lastUpdatedBy: userData.userId,
            lastUpdatedDate: new Date(),
            isCredit: true
        })
        return newPayment;
}


module.exports = {
    createCustomerPaymentPlan,
    getAllCustomerPaymentPlans,
    getCustomerPaymentPlansByCustomerId,
    updateCustomerPaymentPlan
}