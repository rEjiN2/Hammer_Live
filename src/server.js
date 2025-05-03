const { app } = require(".");
const { connectDb } = require("./config/db");

const PORT=5454;
connectDb().then((connected) => {
    if (connected) {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } else {
      console.error("Failed to connect to MongoDB. Server not started.");
    }
  });
  

