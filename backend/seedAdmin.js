require("dotenv").config();
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const connectDB = require("./config/db");

const seed = async () => {
  await connectDB();

  const existing = await Admin.findOne({ email: "admin@smartbin.com" });
  if (existing) {
    console.log("Admin already exists. Skipping.");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await Admin.create({
    name: "System Admin",
    email: "admin@smartbin.com",
    password: hashedPassword,
  });

  console.log("✅ Admin seeded successfully!");
  console.log("Email: admin@smartbin.com");
  console.log("Password: admin123");
  process.exit();
};

seed();