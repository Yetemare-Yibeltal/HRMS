// routes/leaveRoutes.js
// All leave management endpoints

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  getLeaveBalances,
  allocateLeaveBalance,
  allocateToAllEmployees,
  submitLeaveRequest,
  getLeaveRequests,
  getLeaveRequest,
  hodAction,
  hrAction,
  cancelLeaveRequest,
} = require("../controllers/leaveController");

// All routes require login
router.use(protect);

// ── Leave Types ───────────────────────────────────────────────────────────────
router
  .route("/types")
  .get(getLeaveTypes)
  .post(authorize("super_admin", "hr_manager"), createLeaveType);

router
  .route("/types/:id")
  .put(authorize("super_admin", "hr_manager"), updateLeaveType)
  .delete(authorize("super_admin"), deleteLeaveType);

// ── Leave Balances ────────────────────────────────────────────────────────────
router.get("/balances/:employeeId", getLeaveBalances);

router.post(
  "/balances/allocate",
  authorize("super_admin", "hr_manager"),
  allocateLeaveBalance,
);

router.post(
  "/balances/allocate-all",
  authorize("super_admin", "hr_manager"),
  allocateToAllEmployees,
);

// ── Leave Requests ────────────────────────────────────────────────────────────
router.route("/requests").get(getLeaveRequests).post(submitLeaveRequest);

router.get("/requests/:id", getLeaveRequest);

// Approval workflow
router.put(
  "/requests/:id/hod-action",
  authorize("hod", "super_admin"),
  hodAction,
);

router.put(
  "/requests/:id/hr-action",
  authorize("hr_manager", "super_admin"),
  hrAction,
);

// Cancel own request
router.put("/requests/:id/cancel", cancelLeaveRequest);

module.exports = router;
