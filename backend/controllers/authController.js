const Household = require("../models/Household");
const Collector = require("../models/Collector");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" });
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── 1. Check Admin ─────────────────────────────────
    const admin = await Admin.findOne({ email: normalizedEmail, isActive: true });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect password." });
      }

      const token = generateToken({
        id: admin._id,
        role: "admin",
        email: admin.email,
      });

      return res.json({
        success: true,
        role: "admin",
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: "admin",
        },
      });
    }

    // ── 2. Check Collector ─────────────────────────────
    const collector = await Collector.findOne({ email: normalizedEmail, isActive: true });
    if (collector) {
      const isMatch = await bcrypt.compare(password, collector.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect password." });
      }

      const token = generateToken({
        id: collector._id,
        role: "collector",
        email: collector.email,
      });

      return res.json({
        success: true,
        role: "collector",
        token,
        user: {
          id: collector._id,
          name: collector.name,
          employeeId: collector.employeeId,
          assignedBarangay: collector.assignedBarangay,
          contact: collector.contact,
          email: collector.email,
          totalCollections: collector.totalCollections,
          role: "collector",
        },
      });
    }

    // ── 3. Check Household ─────────────────────────────
    const household = await Household.findOne({ email: normalizedEmail, isActive: true });
    if (!household) {
      return res.status(401).json({
        success: false,
        message: "No account found with that email.",
      });
    }

    const isMatch = await bcrypt.compare(password, household.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    const token = generateToken({
      id: household._id,
      role: "household",
      email: household.email,
    });

    return res.json({
      success: true,
      role: "household",
      token,
      user: {
        id: household._id,
        fullname: household.fullname,
        email: household.email,
        contactNumber: household.contactNumber,
        address: household.address,
        rfid: household.rfid,
        role: "household",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { login };