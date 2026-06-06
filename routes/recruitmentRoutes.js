// routes/recruitmentRoutes.js
// All recruitment endpoints

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getJobPostings,
  getJobPosting,
  createJobPosting,
  updateJobPosting,
  publishJobPosting,
  closeJobPosting,
  deleteJobPosting,
  getApplicants,
  getApplicant,
  submitApplication,
  updateApplicantStatus,
  scheduleInterview,
  sendOffer,
  offerResponse,
  hireApplicant,
  getRecruitmentStats,
} = require("../controllers/recruitmentController");

// All routes require login
router.use(protect);

// ── Recruitment Stats ─────────────────────────────────────────────────────────
router.get(
  "/stats",
  authorize("super_admin", "hr_manager"),
  getRecruitmentStats,
);

// ── Job Postings ──────────────────────────────────────────────────────────────
router
  .route("/jobs")
  .get(getJobPostings)
  .post(authorize("super_admin", "hr_manager"), createJobPosting);

router
  .route("/jobs/:id")
  .get(getJobPosting)
  .put(authorize("super_admin", "hr_manager"), updateJobPosting)
  .delete(authorize("super_admin"), deleteJobPosting);

// Job status changes
router.put(
  "/jobs/:id/publish",
  authorize("super_admin", "hr_manager"),
  publishJobPosting,
);

router.put(
  "/jobs/:id/close",
  authorize("super_admin", "hr_manager"),
  closeJobPosting,
);

// ── Applicants ────────────────────────────────────────────────────────────────
router
  .route("/applicants")
  .get(authorize("super_admin", "hr_manager"), getApplicants)
  .post(upload.single("resume"), submitApplication); // open for external applicants

router.get(
  "/applicants/:id",
  authorize("super_admin", "hr_manager"),
  getApplicant,
);

// Applicant workflow actions
router.put(
  "/applicants/:id/status",
  authorize("super_admin", "hr_manager"),
  updateApplicantStatus,
);

router.put(
  "/applicants/:id/schedule-interview",
  authorize("super_admin", "hr_manager"),
  scheduleInterview,
);

router.put(
  "/applicants/:id/offer",
  authorize("super_admin", "hr_manager"),
  upload.single("document"),
  sendOffer,
);

router.put(
  "/applicants/:id/offer-response",
  authorize("super_admin", "hr_manager"),
  offerResponse,
);

router.post(
  "/applicants/:id/hire",
  authorize("super_admin", "hr_manager"),
  hireApplicant,
);

module.exports = router;
