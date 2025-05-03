// const mongoose = require("mongoose")

// // const mongoDbUrl='mongodb+srv://codewithzosh:lognBCBmtWNPjrKC@cluster0.wvt9jpw.mongodb.net/?retryWrites=true&w=majority';
// const mongoDbUrl=process.env.MONGO;
// const connectDb=()=>{
//     return mongoose.connect(mongoDbUrl)
// }

// module.exports={connectDb}
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set('bufferCommands', false); // disable buffering
// mongoose.set("debug", true); // optional

const options = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, 
  socketTimeoutMS: 45000,
};

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO, options);
    console.log("MongoDB Connection ok!");
    global.defaultSettings = { language: "eng" };
    return true;
  } catch (err) {
    console.error(`MongoDB Connection error: ${err.message}`);
    return false;
  }
};

module.exports = { connectDb };
