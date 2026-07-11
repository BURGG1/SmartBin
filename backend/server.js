require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { Bonjour } = require("bonjour-service");
const bonjour = new Bonjour();

const connectDB = require("./config/db");
const deviceRoutes = require("./routes/deviceRoutes");
const householdRoutes = require("./routes/householdRoutes");
const rfidRoutes = require("./routes/rfidRoutes");
const binRoutes = require("./routes/binRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const ruleRoutes = require("./routes/ruleRoutes");
const collectorRoutes = require("./routes/collectorRoutes");

const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const registrationRequestRoutes = require("./routes/registrationRequestRoutes");

const { startBinStatusChecker } = require("./jobs/binStatusChecker");
const { checkAndAutoSchedule } = require("./services/autoScheduleService");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
startBinStatusChecker();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes("localhost") || origin.includes("192.168.")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/rewards", rewardRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/households", householdRoutes);
app.use("/api/rfid", rfidRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/requests", registrationRequestRoutes);
app.use("/api/bins", binRoutes);
app.use("/api/collectors", collectorRoutes);
app.use("/api/devices", deviceRoutes);
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

// Run auto-schedule every 30 seconds
setInterval(async () => {
  try {
    await checkAndAutoSchedule();
  } catch (err) {
    console.error("[AutoSchedule] Error:", err.message);
  }
}, 30000);

// Also run once on startup
checkAndAutoSchedule().catch(console.error);

app.listen(PORT, "0.0.0.0", () => {
  // console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log("Server running on port " + PORT);

  bonjour.publish({ name: "SmartBin", type: "http", port: PORT });
  console.log("mDNS broadcast: http://smartbin.local:" + PORT);
});