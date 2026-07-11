const mongoose = require("mongoose");

const rewardLogSchema = new mongoose.Schema(
  {
    household: { type: mongoose.Schema.Types.ObjectId, ref: "Household", required: true },
    reward: { type: mongoose.Schema.Types.ObjectId, ref: "Reward", required: true },
    rewardName: { type: String, required: true }, // snapshot — survives reward being edited/deleted later
    pointsSpent: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

rewardLogSchema.index({ household: 1, createdAt: -1 });

module.exports = mongoose.model("RewardLog", rewardLogSchema);