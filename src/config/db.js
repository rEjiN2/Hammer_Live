// const mongoose = require("mongoose")

// // const mongoDbUrl='mongodb+srv://codewithzosh:lognBCBmtWNPjrKC@cluster0.wvt9jpw.mongodb.net/?retryWrites=true&w=majority';
// const mongoDbUrl=process.env.MONGO;
// const connectDb=()=>{
//     return mongoose.connect(mongoDbUrl)
// }

// module.exports={connectDb}

const mongoose = require("mongoose");
// const logger = require("./logger");
// const { isDev } = require("./index");

mongoose.Promise = global.Promise;

const option = { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase from default 10000ms to 30000ms
    socketTimeoutMS: 45000, // Increase socket timeout
  };
// if (isDev()) {
//   option.autoIndex = false;
// }

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO, option);
    // logger.info("MongoDB Connection ok!");
    global.defaultSettings = { language: "eng" };
    // mongoose.set("debug", true);
    return true;
  } catch (err) {
    // logger.error(`MongoDB Connection error: ${err.message}`);
    return false;
  }
};

module.exports = {connectDb};
