const userService=require("../services/user.service.js")
const jwtProvider=require("../config/jwtProvider.js")
const bcrypt=require("bcrypt")

const login=async(req,res)=>{
    const {password,email}=req.body;
    try {
        const user = await userService.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found With Email ', email});
        }

        const isPasswordValid=await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            return res.status(401).json({ message: 'Invalid password' });
        }

        const jwt=jwtProvider.generateToken(user._id);

        return res.status(200).send({jwt,message:"login success"});

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}


const signup = async (req, res) => {
     const { body } = req;
    try {
        const user = await userService.createUser(body);
        if(!user.status) {
            return res.status(400).send({ message: user.message });
        }
        return res.status(200).send(user.data);
    } catch (error) {
        return res.status(200).send({ error: error.message });
    }
}
module.exports=
{
    login,
    signup,

}