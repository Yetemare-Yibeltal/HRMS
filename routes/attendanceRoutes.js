// routes/attendanceRoutes.js
// All attendance and work schedule endpoints

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getWorkSchedules,
  createWorkSchedule,
  updateWorkSchedule,
  checkIn,
  checkOut,
  manualEntry,
  getAttendance,
  getMonthlySummary,
  getTodayOverview,
  getDepartmentReport,
} = require("../controllers/attendanceController");

// All routes require login
router.use(protect);

// ── Work Schedules ────────────────────────────────────────────────────────────
router
  .route("/schedules")
  .get(getWorkSchedules)
  .post(authorize("super_admin", "hr_manager"), createWorkSchedule);

router.put(
  "/schedules/:id",
  authorize("super_admin", "hr_manager"),
  updateWorkSchedule,
);

// ── Today Overview (dashboard) ────────────────────────────────────────────────
router.get(
  "/today",
  authorize("super_admin", "hr_manager", "hod"),
  getTodayOverview,
);

// ── Department Report ─────────────────────────────────────────────────────────
router.get(
  "/department-report",
  authorize("super_admin", "hr_manager"),
  getDepartmentReport,
);

// ── Monthly Summary per Employee ──────────────────────────────────────────────
router.get("/summary/:employeeId", getMonthlySummary);

// ── Check In / Check Out ──────────────────────────────────────────────────────
router.post("/checkin", checkIn);
router.put("/checkout", checkOut);

// ── Manual Entry by HR ────────────────────────────────────────────────────────
router.post("/manual", authorize("super_admin", "hr_manager"), manualEntry);

// ── General attendance records with filters ───────────────────────────────────
router.get("/", getAttendance);

module.exports = router;
