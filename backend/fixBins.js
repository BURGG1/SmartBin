require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await mongoose.connection.collection("bins").updateMany(
    {},
    { $set: { isActive: true } }
  );
  console.log("✅ All bins updated with isActive: true");
  process.exit();
});