const DietPlan = require('../models/dietplan.model.js');
const CustomError = require("../utils/CustomError.js");

const addUpdateDietPlans = async (dietplanArray, userData) => {
    try {
        if (!Array.isArray(dietplanArray) || dietplanArray.length === 0) {
            throw new Error("Invalid or empty diet plan data");
        }

        const createList = [];
        const updatePromises = [];

        for (const plan of dietplanArray) {
            const { _id, dietKey, dietValue, customerId, ...rest } = plan;

            // Skip if missing required fields
            if (!dietKey || !dietValue || !customerId) {
                console.warn("Skipping incomplete diet plan:", plan);
                continue;
            }

            if (_id) {
                // Prepare update
                const updateData = {
                    dietKey,
                    dietValue,
                    ...rest,
                    lastUpdatedBy: userData.userId,
                    lastUpdatedDate: new Date(),
                };

                updatePromises.push(
                    DietPlan.findByIdAndUpdate(_id, updateData, { new: true })
                );
            } else {
                // Prepare for creation
                createList.push({
                    customerId,
                    dietKey,
                    dietValue,
                    ...rest,
                    createdBy: userData.userId,
                    createdDate: new Date(),
                    lastUpdatedBy: userData.userId,
                    lastUpdatedDate: new Date(),
                });
            }
        }

        const [createdDietPlans, updatedDietPlans] = await Promise.all([
            createList.length > 0 ? DietPlan.insertMany(createList) : [],
            Promise.all(updatePromises),
        ]);

        return [
            ...updatedDietPlans.filter(Boolean), // removes null, undefined, or false
            ...createdDietPlans
          ];
          
    } catch (error) {
        console.error("Error saving diet plans:", error.message);
        throw new Error(error.message);
    }
};


module.exports = {
    addUpdateDietPlans
}