require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Collector = require("./models/Collector");
const connectDB = require("./config/db");

const COLLECTORS = [
  {
    name: "Collector A",
    employeeId: "EMP-001",
    assignedBarangay: "Palapat",
    assignedBins: [],
    contact: "09171234567",
    email: "collectora@gmail.com",
    totalCollections: 0,
  },
  {
    name: "Collector B",
    employeeId: "EMP-002",
    assignedBarangay: "Palapat",
    assignedBins: [],
    contact: "09181234567",
    email: "collectorb@gmail.com",
    totalCollections: 0,
  },
  {
    name: "Collector C",
    employeeId: "EMP-003",
    assignedBarangay: "Palapat",
    assignedBins: [],
    contact: "09191234567",
    email: "collectorc@gmail.com",
    totalCollections: 0,
  },
];

const DEFAULT_PASSWORD = "collector123";

const seed = async () => {
  await connectDB();

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const collectorData of COLLECTORS) {
    const existing = await Collector.findOne({ email: collectorData.email });

    if (existing) {
      console.log(`⏭️  ${collectorData.name} (${collectorData.email}) already exists. Skipping.`);
      continue;
    }

    await Collector.create({
      ...collectorData,
      password: hashedPassword,
    });

    console.log(`✅ ${collectorData.name} seeded successfully!`);
    console.log(`   Email: ${collectorData.email}`);
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
  }

  console.log("\nSeeding complete.");
  process.exit();
};

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});