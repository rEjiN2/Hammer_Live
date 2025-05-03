const Branch = require('../../models/branch.model.js');
const Trainer = require('../../models/trainer.model.js');
const Customer = require('../../models/customer.model.js');

const generateBranchCode = async () => {
    const year = new Date().getFullYear().toString().slice(-2); // Get last two digits of the year
    const month = ('0' + (new Date().getMonth() + 1)).slice(-2); // Get two-digit month

    // Find the last Branch created in the current year and month
    const lastBranch = await Branch.findOne({ bch_Code: new RegExp(`BCH${year}${month}`) })
        .sort({ bch_Code: -1 });

    let newSequenceNumber = '00001'; // Default for first Branch of the month

    if (lastBranch) {
        // Extract last sequence number and increment
        const lastCode = lastBranch.bch_Code;
        const lastSequence = parseInt(lastCode.slice(-5), 10);
        newSequenceNumber = String(lastSequence + 1).padStart(5, '0');
    }

    return `BCH${year}${month}${newSequenceNumber}`;
};

const generateTrainerCode = async () => {
    const year = new Date().getFullYear().toString().slice(-2); // Get last two digits of the year
    const month = ('0' + (new Date().getMonth() + 1)).slice(-2); // Get two-digit month

    // Find the last Trainer created in the current year and month
    const lastTrainer = await Trainer.findOne({ tnr_Code: new RegExp(`TNR${year}${month}`) })
        .sort({ tnr_Code: -1 });

    let newSequenceNumber = '00001'; // Default for first Trainer of the month

    if (lastTrainer) {
        // Extract last sequence number and increment
        const lastCode = lastTrainer.tnr_Code;
        const lastSequence = parseInt(lastCode.slice(-5), 10);
        newSequenceNumber = String(lastSequence + 1).padStart(5, '0');
    }

    return `TNR${year}${month}${newSequenceNumber}`;
};

const generateCustomerCode = async () => {
    const year = new Date().getFullYear().toString().slice(-2); // Get last two digits of the year
    const month = ('0' + (new Date().getMonth() + 1)).slice(-2); // Get two-digit month

    // Find the last Customer created in the current year and month
    const lastCustomer = await Customer.findOne({ ctr_Code: new RegExp(`CTR${year}${month}`) })
        .sort({ ctr_Code: -1 });

    let newSequenceNumber = '00001'; // Default for first Customer of the month

    if (lastCustomer) {
        // Extract last sequence number and increment
        const lastCode = lastCustomer.ctr_Code;
        const lastSequence = parseInt(lastCode.slice(-5), 10);
        newSequenceNumber = String(lastSequence + 1).padStart(5, '0');
    }

    return `CTR${year}${month}${newSequenceNumber}`;
};

module.exports = {
    generateBranchCode,
    generateTrainerCode,
    generateCustomerCode
}