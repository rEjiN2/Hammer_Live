const paymentService = require("../services/payment.service")

const getAllCustomerPaymentPlans = async (req, res) => {
    try {
        const { data, pagination } = await paymentService.getAllCustomerPaymentPlans(req.query);
        
        res.set('X-Pagination', JSON.stringify(pagination)); // Now handled in controller
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createCustomerPaymentPlan = async (req, res) => {
    try {
        const payment = await paymentService.createCustomerPaymentPlan(req.body, req.user);
        return res.status(200).send(payment);
    } catch (error) {
        return res.status(200).send({ error: error.message });
    }
}

const updateCustomerPaymentPlan = async (req, res) => {
    try {
        const { customerPaymentPlanId } = req.query;

        const payment = await paymentService.updateCustomerPaymentPlan(customerPaymentPlanId, req.body, req.user);
        return res.status(200).send(payment);
    } catch (error) {
        return res.status(200).send({ error: error.message });
    }
}


module.exports={getAllCustomerPaymentPlans,createCustomerPaymentPlan,updateCustomerPaymentPlan}
