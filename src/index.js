const express=require("express")
const cors=require('cors');

const app=express();

app.use(express.json())
// app.use(cors())

// const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:4200', // Angular dev server
    exposedHeaders: ['X-Pagination']
}));



app.get("/",(req,res)=>{
    return res.status(200).send({message:"welcome to ecommerce api - node"})
})

const authRouter=require("./routes/auth.routes.js");
app.use("/auth",authRouter)

const userRouter=require("./routes/user.routes.js");
app.use("/user",userRouter)

const branchRouter=require("./routes/branch.routes.js");
app.use("/branch",branchRouter)

const trainerRouter=require("./routes/trainer.routes.js");
app.use("/trainer",trainerRouter)

const customerRouter=require("./routes/customer.routes.js");
app.use("/customer",customerRouter)

const attendenceRouter=require("./routes/attendance.routes.js");
app.use("/attendence",attendenceRouter)

const dietplanRouter=require("./routes/dietplan.routes.js");
app.use("/diet",dietplanRouter)

const paymentsRouter=require("./routes/payment.routes.js");
app.use("/payment",paymentsRouter)

const accountsRouter=require("./routes/accounts.routes.js");
app.use("/accounts",accountsRouter)

module.exports={app};