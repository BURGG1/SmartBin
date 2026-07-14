const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Household = require("../models/Household");
const Collector = require("../models/Collector");
const Admin = require("../models/Admin");
const { findAccountByEmail } = require("../utils/accountLookup");
const { sendResetCodeEmail } = require("../config/mailer");

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

// ────────────────────────────────────────────────────────────
// Forgot / Reset password
// ────────────────────────────────────────────────────────────

const CODE_LENGTH = Number(process.env.RESET_CODE_LENGTH || 6);
const CODE_EXPIRY_MS = Number(process.env.RESET_CODE_EXPIRY_MINUTES || 10) * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

// Never let a response distinguish "wrong code" from "no such account" from
// "expired code" — that distinction is exactly what lets an attacker
// enumerate accounts or brute-force one field at a time.
const GENERIC_INVALID_MESSAGE = "Invalid or expired code. Please try again.";

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

function generateNumericCode(length) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(crypto.randomInt(min, max + 1));
}

// HMAC (not bcrypt) for the code: it's short-lived, checked at most a
// handful of times, and doesn't need bcrypt's deliberate slowness — a keyed
// hash with a server-side secret is enough. Requires RESET_CODE_SECRET in .env.
function hashCode(code) {
  return crypto.createHmac("sha256", process.env.RESET_CODE_SECRET).update(code).digest("hex");
}

function timingSafeEqualHex(a, b) {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Works across Admin, Collector, and Household. Always responds 200
 * { success: true } regardless of whether the email exists or has no email
 * on file (Household.email can be null), so the endpoint can't be used to
 * enumerate accounts.
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const found = await findAccountByEmail(normalizedEmail);

    if (found) {
      const { account } = found;
      const code = generateNumericCode(CODE_LENGTH);

      account.resetPasswordCodeHash = hashCode(code);
      account.resetPasswordExpires = new Date(Date.now() + CODE_EXPIRY_MS);
      account.resetPasswordAttempts = 0;
      account.resetPasswordLockedUntil = null;
      await account.save();

      // A failed/slow email send shouldn't leak "account exists" via an
      // error response or timing — log it, still return generic success.
      try {
        await sendResetCodeEmail({ to: normalizedEmail, code });
      } catch (emailErr) {
        console.error("[forgotPassword] failed to send email:", emailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "If that email is registered, a reset code has been sent.",
    });
  } catch (error) {
    console.error("[forgotPassword] error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

/**
 * POST /api/auth/reset-password
 * Body: { email, code, newPassword }
 * Works across Admin, Collector, and Household.
 */
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!isValidEmail(email) || !code || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing or invalid fields." });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const found = await findAccountByEmail(normalizedEmail);

    if (!found || !found.account.resetPasswordCodeHash || !found.account.resetPasswordExpires) {
      return res.status(400).json({ success: false, message: GENERIC_INVALID_MESSAGE });
    }

    const { account } = found;

    if (account.resetPasswordLockedUntil && account.resetPasswordLockedUntil > new Date()) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new code later.",
      });
    }

    if (account.resetPasswordExpires < new Date()) {
      account.resetPasswordCodeHash = null;
      account.resetPasswordExpires = null;
      await account.save();
      return res.status(400).json({ success: false, message: GENERIC_INVALID_MESSAGE });
    }

    const providedHash = hashCode(String(code).trim());
    const matches = timingSafeEqualHex(providedHash, account.resetPasswordCodeHash);

    if (!matches) {
      account.resetPasswordAttempts += 1;
      if (account.resetPasswordAttempts >= MAX_VERIFY_ATTEMPTS) {
        account.resetPasswordLockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        account.resetPasswordCodeHash = null; // burn the code, they'll need a fresh one after lockout
        account.resetPasswordExpires = null;
      }
      await account.save();
      return res.status(400).json({ success: false, message: GENERIC_INVALID_MESSAGE });
    }

    // Success: set new password, clear all reset state (single-use code).
    account.password = await bcrypt.hash(newPassword, 12);
    account.resetPasswordCodeHash = null;
    account.resetPasswordExpires = null;
    account.resetPasswordAttempts = 0;
    account.resetPasswordLockedUntil = null;
    await account.save();

    // OPTIONAL: if you later add a tokenVersion field for JWT invalidation,
    // bump it here so old sessions issued before the reset stop working.

    return res.status(200).json({ success: true, message: "Password has been reset successfully." });
  } catch (error) {
    console.error("[resetPassword] error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

module.exports = { login, forgotPassword, resetPassword };