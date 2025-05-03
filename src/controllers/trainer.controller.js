const trainerService = require("../services/trainer.service")

const getAllTrainer = async (req, res) => {
    try {
        const { trainers, pagination } = await trainerService.getAllTrainer(req.query);
        
        res.set('X-Pagination', JSON.stringify(pagination)); // Now handled in controller
        return res.status(200).json(trainers);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const createTrainer = async (req, res) => {
    try {
        const trainer = await trainerService.createTrainer(req.body, req.user);
        return res.status(200).send(trainer);
    } catch (error) {
        return res.status(200).send({ error: error.message });
    }
}

const updateTrainer = async (req, res) => {

    try {
        const { trainerId } = req.query;
        const updatedTrainer = await trainerService.updateTrainer(trainerId, req.body);
        return res.status(200).send({ message: "Trainer updated successfully", updatedTrainer });
    } catch (error) {
        return res.status(200).send({ error: error.message })
    }

}

module.exports = { getAllTrainer, createTrainer, updateTrainer }