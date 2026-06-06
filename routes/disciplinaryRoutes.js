// routes/disciplinaryRoutes.js
// All disciplinary and grievance endpoints

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getDisciplinaryCases,
  getDisciplinaryCase,
  createCase,
  updateCase,
  recordHearing,
  resolveCase,
  closeCase,
  getDisciplinaryStats,
} = require("../controllers/disciplinaryController");

router.use(protect);

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get(
  "/stats",
  authorize("super_admin", "hr_manager"),
  getDisciplinaryStats,
);

// ── Main CRUD ─────────────────────────────────────────────────────────────────
router
  .route("/")
  .get(authorize("super_admin", "hr_manager"), getDisciplinaryCases)
  .post(
    authorize("super_admin", "hr_manager"),
    upload.array("evidence", 5), // allow up to 5 evidence files
    createCase,
  );

router
  .route("/:id")
  .get(authorize("super_admin", "hr_manager"), getDisciplinaryCase)
  .put(authorize("super_admin", "hr_manager"), updateCase);

// ── Workflow Actions ──────────────────────────────────────────────────────────
router.put(
  "/:id/hearing",
  authorize("super_admin", "hr_manager"),
  recordHearing,
);

router.put("/:id/resolve", authorize("super_admin", "hr_manager"), resolveCase);

router.put("/:id/close", authorize("super_admin"), closeCase);

module.exports = router;
