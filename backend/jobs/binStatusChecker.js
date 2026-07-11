const Bin = require("../models/Bin");

const BIN_TIMEOUT_MS = 60000; // 60 seconds — mark offline if no heartbeat

const startBinStatusChecker = () => {
  setInterval(async () => {
    try {
      const cutoff = new Date(Date.now() - BIN_TIMEOUT_MS);

      const result = await Bin.updateMany(
        {
          status: "online",
          lastHeartbeat: { $lt: cutoff },
        },
        {
          status: "offline",
          isActive: false,
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`⚠ ${result.modifiedCount} bin(s) marked offline due to missed heartbeat`);
      }
    } catch (err) {
      console.error("Bin status checker error:", err.message);
    }
  }, 30000); // check every 30 seconds
};

module.exports = { startBinStatusChecker };