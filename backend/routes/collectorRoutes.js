const express = require("express");
const router = express.Router();
const Collector = require("../models/Collector");
const { protect } = require("../middleware/authMiddleware");

// GET /api/collectors/me — get logged-in collector's profile
router.get("/me", protect, async (req, res) => {
  try {
    const collector = await Collector.findById(req.user.id).select("-password");
    if (!collector) {
      return res.status(404).json({ success: false, message: "Collector not found." });
    }
    res.json({ success: true, data: collector });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;