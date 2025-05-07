const dietplanService = require("../services/dietplan.service")


const addUpdateDietPlans = async (req, res) => {

    try {
        const updatedDietplan = await dietplanService.addUpdateDietPlans(req.body, req.user);
        return res.status(200).send({ message: "Diet plan updated successfully", response: updatedDietplan });
    } catch (error) {
        return res.status(200).send({ error: error.message })
    }

}

module.exports = { addUpdateDietPlans }