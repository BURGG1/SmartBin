const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    decs: { type: String, required: true },
    points: { type: String, required: true },
    freq: { type: String, required: true },
    auto: { type: Boolean, default: false },
    streakDays: { type: Number, default: null }, // only for "per streak" freq
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rule", ruleSchema);