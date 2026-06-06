// routes/payrollRoutes.js
// All payroll and compensation endpoints

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getSalaryStructures,
  createSalaryStructure,
  updateSalaryStructure,
  processSinglePayroll,
  processAllPayroll,
  approvePayroll,
  markAsPaid,
  getPayrolls,
  getPayroll,
  getMyPayslips,
  getPayrollReport,
} = require("../controllers/payrollController");

// All routes require login
router.use(protect);

// ── Salary Structures ─────────────────────────────────────────────────────────
router
  .route("/structures")
  .get(
    authorize("super_admin", "hr_manager", "payroll_officer"),
    getSalaryStructures,
  )
  .post(authorize("super_admin", "hr_manager"), createSalaryStructure);

router.put(
  "/structures/:id",
  authorize("super_admin", "hr_manager"),
  updateSalaryStructure,
);

// ── Payroll Processing ────────────────────────────────────────────────────────
router.post(
  "/process/single",
  authorize("super_admin", "payroll_officer"),
  processSinglePayroll,
);

router.post(
  "/process/all",
  authorize("super_admin", "payroll_officer"),
  processAllPayroll,
);

// ── Payroll Report ────────────────────────────────────────────────────────────
router.get(
  "/report",
  authorize("super_admin", "hr_manager", "payroll_officer"),
  getPayrollReport,
);

// ── Employee Self-Service Payslips ────────────────────────────────────────────
router.get("/my-payslips", getMyPayslips);

// ── All Payrolls (with filters) ───────────────────────────────────────────────
router.get(
  "/",
  authorize("super_admin", "hr_manager", "payroll_officer"),
  getPayrolls,
);

// ── Single Payroll / Payslip ──────────────────────────────────────────────────
router.get("/:id", getPayroll);

// ── Approve Payroll ───────────────────────────────────────────────────────────
router.put(
  "/:id/approve",
  authorize("super_admin", "hr_manager"),
  approvePayroll,
);

// ── Mark as Paid ──────────────────────────────────────────────────────────────
router.put(
  "/:id/mark-paid",
  authorize("super_admin", "payroll_officer"),
  markAsPaid,
);

module.exports = router;
