const attendanceService = require("../services/attendance.service")



const createAttendence = async (req, res) => {
    try {
        const attendance = await attendanceService.createAttendence(req.body,req.user);
        return res.status(200).send(attendance);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}
const getAttendence = async (req, res) => {
    try {
        const attendance = await attendanceService.getAttendence(req,res);
        return res.status(200).send(attendance);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}



module.exports = { createAttendence,getAttendence}