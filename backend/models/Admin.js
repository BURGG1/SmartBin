const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
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
    role: { type: String, default: "admin" },
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

module.exports = mongoose.model("Admin", adminSchema);