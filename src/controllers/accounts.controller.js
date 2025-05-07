const accountsService = require("../services/accounts.service")

const getAllAccounts = async (req, res) => {
    try {
        const { accounts, pagination } = await accountsService.getAllAccounts(req.query);
        
        res.set('X-Pagination', JSON.stringify(pagination)); // Now handled in controller
        return res.status(200).json(accounts);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createAccountEntry = async (req, res) => {
    try {
        const payment = await accountsService.createAccountEntry(req.body, req.user);
        return res.status(200).send(payment);
    } catch (error) {
        return res.status(200).send({ error: error.message });
    }
}

const updateAccountEntry = async (req, res) => {
    try {
        const { accountId } = req.query;

        const payment = await accountsService.updateAccountEntry(accountId, req.body, req.user);
        return res.status(200).send(payment);
    } catch (error) {
        return res.status(200).send({ error: error.message });
    }
}


module.exports={getAllAccounts,createAccountEntry,updateAccountEntry}
