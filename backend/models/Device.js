const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true },
    lat: { type: Number },
    lng: { type: Number },
    lastSeen: { type: Date },
    assignedBin: { type: mongoose.Schema.Types.ObjectId, ref: "Bin", default: null },

    // ── Fill level, reported by the HC-SR04 on the same ESP32 ──────────────
    fillLevel: { type: Number, min: 0, max: 100, default: null },
    distanceCm: { type: Number, default: null },
    lastFillUpdate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Device", deviceSchema);