// routes/appraisalRoutes.js
// All performance appraisal endpoints

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAppraisals,
  getAppraisal,
  createAppraisal,
  bulkCreateAppraisals,
  updateGoals,
  submitSelfAppraisal,
  managerReview,
  completeAppraisal,
  deleteAppraisal,
  getAppraisalStats,
} = require("../controllers/appraisalController");

// All routes require login
router.use(protect);

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get("/stats", authorize("super_admin", "hr_manager"), getAppraisalStats);

// ── Bulk Create ───────────────────────────────────────────────────────────────
router.post(
  "/bulk-create",
  authorize("super_admin", "hr_manager"),
  bulkCreateAppraisals,
);

// ── Main CRUD ─────────────────────────────────────────────────────────────────
router
  .route("/")
  .get(getAppraisals)
  .post(authorize("super_admin", "hr_manager"), createAppraisal);

router
  .route("/:id")
  .get(getAppraisal)
  .delete(authorize("super_admin"), deleteAppraisal);

// ── Appraisal Workflow Stages ─────────────────────────────────────────────────

// HR/HOD sets goals for employee
router.put(
  "/:id/goals",
  authorize("super_admin", "hr_manager", "hod"),
  updateGoals,
);

// Employee submits self appraisal
router.put("/:id/self-appraisal", submitSelfAppraisal);

// HOD/Manager scores and reviews
router.put(
  "/:id/manager-review",
  authorize("super_admin", "hr_manager", "hod"),
  managerReview,
);

// HR finalizes and completes
router.put(
  "/:id/complete",
  authorize("super_admin", "hr_manager"),
  completeAppraisal,
);

module.exports = router;
