const mongoose = require("mongoose");

const pointLogSchema = new mongoose.Schema(
  {
    household: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      required: true,
    },
    rule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rule",
      default: null,
    },
    points: { type: Number, required: true },
    quantity: { type: Number, default: 1 },  // ← add this
    reason: { type: String, required: true },
    awardedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PointLog", pointLogSchema);