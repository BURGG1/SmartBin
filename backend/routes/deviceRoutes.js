const express = require("express");
const router = express.Router();
const { updateDeviceLocation, getAvailableDevices, updateFillLevel } = require("../controllers/deviceController");

router.post("/location", updateDeviceLocation);
router.post("/fill-level", updateFillLevel);
router.get("/available", getAvailableDevices);

module.exports = router;