const branchService = require("../services/branch.service")

const getAllBranch = async (req, res) => {
    try {
        const { branchs, pagination } = await branchService.getAllBranchs(req.query);
        res.set('X-Pagination', JSON.stringify(pagination)); // Now handled in controller
        return res.status(200).send(branchs);
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

const createBranch = async (req, res) => {
    try {
        const branch = await branchService.createBranch(req.body, req.user);
        return res.status(200).send(branch);
    } catch (error) {
        return res.status(200).send({ error: error.message });
    }
}

const updateBranch = async (req, res) => {

    try {
        const { branchId } = req.query;
        const updatedBranch = await branchService.updateBranch(branchId, req.body);
        return res.status(200).send({ message: "Branch updated successfully", updatedBranch });
    } catch (error) {
        return res.status(200).send({ error: error.message })
    }

}

const getAllBranchAutocomplete = async (req, res) => {
    try {
        const branches = await branchService.getAllBranchAutocomplete();
        const filteredBranches = branches.map(branch => ({
            _id: branch._id,
            bch_Name: branch.bch_Name,
            bch_Code: branch.bch_Code
        }));
        // Select only the required fields
        return res.status(200).send(filteredBranches);
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

module.exports = { getAllBranch, createBranch, updateBranch, getAllBranchAutocomplete }