const customerService = require("../services/customer.service.js")

const getCustomerDetailsById = async (req, res) => {
    try {
        const customers = await customerService.getCustomerDetailsById(req.query.customerId);
        
        return res.status(200).send(customers);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getAllCustomer = async (req, res) => {
    try {
        const { customers, pagination } = await customerService.getAllCustomer(req.query);
        
        res.set('X-Pagination', JSON.stringify(pagination)); // Now handled in controller
        return res.status(200).json(customers);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const createCustomer = async (req, res) => {
    try {
        const customer = await customerService.createCustomer(req.body, req.user);
        return res.status(200).send(customer);
    } catch (error) {
        return res.status(200).send({ error: error.message });
    }
}

const updateCustomer = async (req, res) => {

    try {
        const { customerId } = req.query;
        const updatedCustomer = await customerService.updateCustomer(customerId, req.body);
        return res.status(200).send({ message: "Customer updated successfully", updatedCustomer });
    } catch (error) {
        return res.status(200).send({ error: error.message })
    }

}

module.exports = { getCustomerDetailsById, getAllCustomer, createCustomer, updateCustomer }