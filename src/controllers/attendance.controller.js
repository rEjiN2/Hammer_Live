const attendanceService = require("../services/attendance.service")



const checkIn = async (req, res) => {
    try {
        const attendance = await attendanceService.checkIn(req.body,req.user);
        return res.status(200).send(attendance);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}
const getAllAttendance = async (req, res) => {
    try {
        const selectedDate = req.query.attendanceDate;
        const { attendance, pagination } = await attendanceService.getAllAttendance(selectedDate, req.query);
        res.set('X-Pagination', JSON.stringify(pagination)); // Now handled in controller
        return res.status(200).send(attendance);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}



module.exports = { checkIn,getAllAttendance}