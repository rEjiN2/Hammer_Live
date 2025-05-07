const Accounts = require('../models/accounts.model.js');
const {paymentTypeMaster} = require('../shared/master-datas/accounts-plans.js');
const {paymentPlanMaster} = require('../shared/master-datas/payment-plans.js')

const getAllAccounts = async (query) => {
    try {
        let { pageNo, pageSize, actionDateFrom, actionDateTo, amount, remarks, isCredit, paymentTypeId } = query;

        pageNo = parseInt(pageNo) || 1;
        pageSize = parseInt(pageSize) || 15;
        const skip = (pageNo - 1) * pageSize;

        // Build filters
        const filter = { isDeleted: false };

        if (amount) {
            filter.amount = Number(amount);
        }

        if (remarks) {
            filter.remarks = { $regex: remarks, $options: "i" };
        }

        if (isCredit !== undefined) {
            filter.isCredit = isCredit === "true";
        }

        if (paymentTypeId) {
            filter.paymentTypeId = paymentTypeId;
        }

        const normalizeDate = (date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d;
        };
        
        if (actionDateFrom || actionDateTo) {
            const start = actionDateFrom ? normalizeDate(actionDateFrom) : null;
            const end = actionDateTo ? normalizeDate(actionDateTo) : null;
        
            if (start && end) {
                const endNextDay = new Date(end);
                endNextDay.setDate(end.getDate() + 1);
                filter.actionDate = {
                    $gte: start,
                    $lt: endNextDay
                };
            } else if (start && !end) {
                const nextDay = new Date(start);
                nextDay.setDate(nextDay.getDate() + 1);
                filter.actionDate = {
                    $gte: start,
                    $lt: nextDay
                };
            } else if (!start && end) {
                const nextDay = new Date(end);
                nextDay.setDate(nextDay.getDate() + 1);
                filter.actionDate = {
                    $lt: nextDay
                };
            }
        }

        let accounts = await Accounts.find(filter, "paymentPlanId customerId amount isCredit remarks actionDate paymentTypeId createdDate")
            .populate({
                path: "customerId",
                select: "ctr_Name ctr_MobileNo",
            })
            .sort({ createdDate: -1 }) // <-- Added sort here
            .skip(skip)
            .limit(pageSize);

        accounts = accounts.map(({ _id, customerId, paymentPlanId, paymentTypeId, amount, isCredit, remarks, actionDate }) => ({
            _id,
            amount,
            isCredit,
            remarks,
            actionDate,
            customer: customerId,
            customerId: customerId?._id,
            paymentPlanId: paymentPlanId,
            paymentType: paymentTypeMaster?.filter((x) => x._id == paymentTypeId)?.[0],
        }));

        const totalCount = await Accounts.countDocuments(filter);

        return {
            accounts,
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
        console.error("Error fetching accounts:", error.message);
        throw new Error(error.message);
    }
};

const createAccountEntry = async (accountData, userData) => {
    try {
        const {
            paymentPlanId,
            customerId,
            amount,
            isCredit,
            remarks,
            paymentTypeId,
        } = accountData;

        const newAccount = await Accounts.create({
            paymentPlanId,
            customerId,
            amount,
            isCredit,
            remarks,
            actionDate: new Date(),
            paymentTypeId,
            createdBy: userData.userId,
            createdDate: new Date(),
            lastUpdatedBy: userData.userId,
            lastUpdatedDate: new Date()
        });

        return {
            _id: newAccount._id,
            paymentPlanId: newAccount.paymentPlanId,
            customerId: newAccount.customerId,
            amount: newAccount.amount,
            isCredit: newAccount.isCredit,
            remarks: newAccount.remarks,
            actionDate: newAccount.actionDate,
            paymentTypeId: newAccount.paymentTypeId
        };
    } catch (error) {
        console.error("Error creating account entry:", error.message);
        throw new Error(error.message);
    }
};


const updateAccountEntry = async (accountId, updatedData, userData) => {
    try {
        const existingAccount = await Accounts.findById(accountId);
        if (!existingAccount || existingAccount.isDeleted) {
            throw new Error("Account entry not found or has been deleted");
        }

        const updateFields = {
            ...updatedData,
            lastUpdatedBy: userData.userId,
            lastUpdatedDate: new Date()
        };

        const updatedAccount = await Accounts.findByIdAndUpdate(
            accountId,
            { $set: updateFields },
            { new: true }
        );

        return {
            _id: updatedAccount._id,
            paymentPlanId: updatedAccount.paymentPlanId,
            customerId: updatedAccount.customerId,
            amount: updatedAccount.amount,
            isCredit: updatedAccount.isCredit,
            remarks: updatedAccount.remarks,
            actionDate: updatedAccount.actionDate,
            paymentTypeId: updatedAccount.paymentTypeId
        };
    } catch (error) {
        console.error("Error updating account entry:", error.message);
        throw new Error(error.message);
    }
};


module.exports = {
    createAccountEntry,
    updateAccountEntry,
    getAllAccounts,
}