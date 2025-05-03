const mongoose = require("mongoose")

// const mongoDbUrl='mongodb+srv://codewithzosh:lognBCBmtWNPjrKC@cluster0.wvt9jpw.mongodb.net/?retryWrites=true&w=majority';
const mongoDbUrl=process.env.MONGO;
const connectDb=()=>{
    return mongoose.connect(mongoDbUrl)
}

module.exports={connectDb}