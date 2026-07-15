const mongoose = require("mongoose");

const collectorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    assignedBarangay: {
      type: String,
      default: null,
    },
    assignedBins: {
      type: [String], // stores Bin.binId values, e.g. "BIN-001"
      default: [],
    },
    contact: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    totalCollections: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // --- Password reset fields (new) ---
    resetPasswordCodeHash: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    resetPasswordAttempts: { type: Number, default: 0 },
    resetPasswordLockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Collector", collectorSchema);