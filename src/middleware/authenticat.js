const jwtProvider = require("../config/jwtProvider")
const userService = require("../services/user.service")


const authenticate = async (req, res, next) => {

    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            return res.status(401).send({ message: "Authorization header not found" });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(404).send({ message: "token not found" })
        }
        const userData = jwtProvider.getUserIdFromToken(token);
        console.log(userData, 'this is userData')
        req.user = userData;
        next();
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }

}

module.exports = { authenticate };