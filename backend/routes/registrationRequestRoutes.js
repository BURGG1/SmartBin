const express = require("express");
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  updateRequestStatus,
} = require("../controllers/registrationRequestController");

router.post("/", createRequest);
router.get("/", getAllRequests);
router.patch("/:id/status", updateRequestStatus);

module.exports = router;