const mongoose = require("mongoose");

const binScheduleSchema = new mongoose.Schema(
  {
    bin:       { type: mongoose.Schema.Types.ObjectId, ref: "Bin", required: true },
    binId:     { type: String, required: true },
    collector: { type: mongoose.Schema.Types.ObjectId, ref: "Collector", required: true },
    collectorName: { type: String, required: true },
    scheduledAt:   { type: Date, default: Date.now },
    completedAt:   { type: Date, default: null },
    status:        { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
    triggeredBy:   { type: String, enum: ["auto", "manual"], default: "auto" },
    fillAtSchedule: { type: Number, default: 0 },
  },
  { timestamps: true }
);

binScheduleSchema.index({ binId: 1, status: 1 });
binScheduleSchema.index({ collector: 1, status: 1 });

module.exports = mongoose.model("BinSchedule", binScheduleSchema);