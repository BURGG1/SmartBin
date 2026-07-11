const mongoose = require("mongoose");

const registrationRequestSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Fullname is required"],
      trim: true,
    },
    familyMember: {
      type: Number,
      default: null,
    },
    address: {
      houseNo: { type: String, default: null },
      street: { type: String, default: null },
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    contactNumber: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RegistrationRequest", registrationRequestSchema);