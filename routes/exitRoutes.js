// routes/exitRoutes.js
// All exit and offboarding endpoints

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getExits,
  getExit,
  initiateExit,
  updateClearance,
  updateSettlement,
  recordExitInterview,
  completeExit,
  getExitStats,
} = require("../controllers/exitController");

router.use(protect);

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get("/stats", authorize("super_admin", "hr_manager"), getExitStats);

// ── Main CRUD ─────────────────────────────────────────────────────────────────
router
  .route("/")
  .get(authorize("super_admin", "hr_manager"), getExits)
  .post(authorize("super_admin", "hr_manager"), initiateExit);

router.get("/:id", authorize("super_admin", "hr_manager"), getExit);

// ── Workflow Actions ──────────────────────────────────────────────────────────
router.put(
  "/:id/clearance",
  authorize("super_admin", "hr_manager"),
  updateClearance,
);

router.put(
  "/:id/settlement",
  authorize("super_admin", "hr_manager", "payroll_officer"),
  updateSettlement,
);

router.put(
  "/:id/interview",
  authorize("super_admin", "hr_manager"),
  recordExitInterview,
);

router.put(
  "/:id/complete",
  authorize("super_admin", "hr_manager"),
  completeExit,
);

module.exports = router;
