// routes/trainingRoutes.js
// All training and development endpoints

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getTrainings,
  getTraining,
  createTraining,
  updateTraining,
  deleteTraining,
  nominateEmployees,
  updateParticipantStatus,
  updateTrainingStatus,
  getTrainingStats,
} = require("../controllers/trainingController");

router.use(protect);

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get("/stats", authorize("super_admin", "hr_manager"), getTrainingStats);

// ── Main CRUD ─────────────────────────────────────────────────────────────────
router
  .route("/")
  .get(getTrainings)
  .post(authorize("super_admin", "hr_manager"), createTraining);

router
  .route("/:id")
  .get(getTraining)
  .put(authorize("super_admin", "hr_manager"), updateTraining)
  .delete(authorize("super_admin"), deleteTraining);

// ── Status Update ─────────────────────────────────────────────────────────────
router.put(
  "/:id/status",
  authorize("super_admin", "hr_manager"),
  updateTrainingStatus,
);

// ── Nominations ───────────────────────────────────────────────────────────────
router.post(
  "/:id/nominate",
  authorize("super_admin", "hr_manager", "hod"),
  nominateEmployees,
);

// ── Participant Status ────────────────────────────────────────────────────────
router.put(
  "/:id/participants/:employeeId",
  authorize("super_admin", "hr_manager"),
  updateParticipantStatus,
);

module.exports = router;
