const express = require("express");
const router = express.Router();
const Bin = require("../models/Bin");
const BinSchedule = require("../models/BinSchedule");
const Collector = require("../models/Collector");
const { checkAndAutoSchedule, findBestCollector, unassignBinFromCollector } = require("../services/autoScheduleService");
const { dispose, getAllBins, createBin, updateBin, deleteBin, getBinCount, heartbeat } = require("../controllers/binController");


router.post("/heartbeat", heartbeat);

// ── Must be before /:id routes ────────────────────────────────────────────────
router.post("/dispose", dispose);
router.post("/update-location", async (req, res) => {
  try {
    const { binId, lat, lng } = req.body;

    if (!binId || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: "binId, lat, lng required" });
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      return res.status(400).json({ success: false, message: "lat and lng must be valid numbers" });
    }

    const bin = await Bin.findOneAndUpdate(
      { binId },
      { lat: latNum, lng: lngNum },
      { new: true }
    );

    if (!bin) {
      return res.status(404).json({ success: false, message: "Bin not found" });
    }

    res.json({ success: true, message: "Location updated", data: { binId, lat: latNum, lng: lngNum } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// ── Collection routes ─────────────────────────────────────────────────────────
router.get("/", getAllBins);
router.post("/", createBin);

router.get("/count", getBinCount);

// ── Single bin routes ─────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.id);
    if (!bin) return res.status(404).json({ success: false, message: "Bin not found" });
    res.json({ success: true, data: bin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const allowedFields = ["name", "type", "capacity", "location", "fill", "lastEmptied", "lat", "lng"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const bin = await Bin.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!bin) return res.status(404).json({ success: false, message: "Bin not found" });
    res.json({ success: true, data: bin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const bin = await Bin.findByIdAndDelete(req.params.id);
    if (!bin) return res.status(404).json({ success: false, message: "Bin not found" });
    res.json({ success: true, message: `${bin.binId} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bins/schedules — all pending schedules
router.get("/schedules", async (req, res) => {
  try {
    const schedules = await BinSchedule.find({ status: "pending" })
      .populate("collector", "name email contact")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bins/:binId/schedule
router.post("/:binId/schedule", async (req, res) => {
    try {
        const { binId } = req.params;
        const { collector: collectorName, date } = req.body;

        const bin = await Bin.findOne({ binId });
        if (!bin) return res.status(404).json({ success: false, message: "Bin not found" });

        // Cancel existing pending schedule and unassign from collector
        const existingSchedule = await BinSchedule.findOne({ binId, status: "pending" });
        if (existingSchedule) {
            await BinSchedule.updateMany({ binId, status: "pending" }, { status: "cancelled" });
            await unassignBinFromCollector(binId);
        }

        // Find collector by name or pick best available
        let collector;
        if (collectorName) {
            collector = await Collector.findOne({ name: collectorName, isActive: true });
        }
        if (!collector) {
            collector = await findBestCollector();
        }
        if (!collector) {
            return res.status(400).json({ success: false, message: "No available collectors." });
        }

        const schedule = await BinSchedule.create({
            bin:            bin._id,
            binId,
            collector:      collector._id,
            collectorName:  collector.name,
            fillAtSchedule: bin.fill,
            scheduledAt:    date ? new Date(date) : new Date(),
            triggeredBy:    "manual",
        });

        // Add to collector's assignedBins
        await Collector.findByIdAndUpdate(
            collector._id,
            { $addToSet: { assignedBins: binId } }
        );

        res.json({
            success: true,
            message: `${binId} scheduled for ${collector.name}`,
            data: {
                collector: collector.name,
                date:      schedule.scheduledAt,
                binId,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/bins/:binId/schedule/complete
router.post("/:binId/schedule/complete", async (req, res) => {
    try {
        const { binId } = req.params;

        const schedule = await BinSchedule.findOneAndUpdate(
            { binId, status: "pending" },
            { status: "completed", completedAt: new Date() },
            { new: true }
        );

        if (!schedule) {
            return res.status(404).json({ success: false, message: "No pending schedule found." });
        }

        // Reset bin fill after collection
        await Bin.findOneAndUpdate(
            { binId },
            { fill: 0, lastEmptied: new Date() }
        );

        // Remove bin from collector's assignedBins
        await unassignBinFromCollector(binId);

        // Update collector's totalCollections count
        await Collector.findByIdAndUpdate(
            schedule.collector,
            { $inc: { totalCollections: 1 } }
        );

        res.json({
            success: true,
            message: `${binId} marked as collected.`,
            data:    schedule,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/bins/auto-schedule — trigger auto-scheduling manually
router.post("/auto-schedule", async (req, res) => {
  try {
    const count = await checkAndAutoSchedule();
    res.json({ success: true, message: `Auto-scheduled ${count} bin(s).`, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;