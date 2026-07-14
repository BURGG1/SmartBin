const express = require("express");
const router = express.Router();
const { login, forgotPassword, resetPassword } = require("../controllers/authController");
const { loginLimiter, forgotPasswordLimiter, resetPasswordLimiter } = require("../middleware/rateLimiter");

router.post("/login", loginLimiter, login);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);

module.exports = router;