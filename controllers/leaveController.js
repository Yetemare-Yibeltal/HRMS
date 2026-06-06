// controllers/leaveController.js
// Handles all leave management operations:
// leave types, balance allocation, requests, and approval workflow

const { LeaveType, LeaveBalance, LeaveRequest } = require("../models/Leave");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE TYPES
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all leave types
// @route   GET /api/leaves/types
// @access  Private
exports.getLeaveTypes = asyncHandler(async (req, res) => {
  const types = await LeaveType.find({ status: "Active" }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: types.length,
    types,
  });
});

// @desc    Create leave type
// @route   POST /api/leaves/types
// @access  Super Admin, HR Manager
exports.createLeaveType = asyncHandler(async (req, res, next) => {
  const {
    name,
    code,
    defaultDays,
    isPaid,
    requiresProof,
    carryForward,
    maxCarryDays,
    gender,
  } = req.body;

  // Check for duplicate name or code
  const existing = await LeaveType.findOne({
    $or: [{ name }, { code: code?.toUpperCase() }],
  });
  if (existing) {
    return next(
      new ErrorHandler(
        "Leave type with this name or code already exists.",
        400,
      ),
    );
  }

  const leaveType = await LeaveType.create({
    name,
    code,
    defaultDays,
    isPaid,
    requiresProof,
    carryForward,
    maxCarryDays,
    gender,
  });

  res.status(201).json({
    success: true,
    message: "Leave type created successfully.",
    leaveType,
  });
});

// @desc    Update leave type
// @route   PUT /api/leaves/types/:id
// @access  Super Admin, HR Manager
exports.updateLeaveType = asyncHandler(async (req, res, next) => {
  const leaveType = await LeaveType.findById(req.params.id);
  if (!leaveType) {
    return next(new ErrorHandler("Leave type not found.", 404));
  }

  const updated = await LeaveType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Leave type updated.",
    leaveType: updated,
  });
});

// @desc    Delete leave type
// @route   DELETE /api/leaves/types/:id
// @access  Super Admin
exports.deleteLeaveType = asyncHandler(async (req, res, next) => {
  const leaveType = await LeaveType.findById(req.params.id);
  if (!leaveType) {
    return next(new ErrorHandler("Leave type not found.", 404));
  }

  await leaveType.deleteOne();

  res.status(200).json({
    success: true,
    message: "Leave type deleted.",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE BALANCES
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get leave balances for an employee
// @route   GET /api/leaves/balances/:employeeId
// @access  Private
exports.getLeaveBalances = asyncHandler(async (req, res, next) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();

  // Employees can only see their own balances
  if (
    req.user.role === "employee" &&
    req.user.employee?._id.toString() !== req.params.employeeId
  ) {
    return next(
      new ErrorHandler("Not authorized to view these balances.", 403),
    );
  }

  const balances = await LeaveBalance.find({
    employee: req.params.employeeId,
    year,
  }).populate("leaveType", "name code isPaid");

  res.status(200).json({
    success: true,
    year,
    balances,
  });
});

// @desc    Allocate leave balance to an employee
// @route   POST /api/leaves/balances/allocate
// @access  Super Admin, HR Manager
exports.allocateLeaveBalance = asyncHandler(async (req, res, next) => {
  const { employeeId, leaveTypeId, year, allocated } = req.body;

  // Verify employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  // Verify leave type exists
  const leaveType = await LeaveType.findById(leaveTypeId);
  if (!leaveType) {
    return next(new ErrorHandler("Leave type not found.", 404));
  }

  // Check if balance already exists for this year
  let balance = await LeaveBalance.findOne({
    employee: employeeId,
    leaveType: leaveTypeId,
    year,
  });

  if (balance) {
    // Update existing balance
    balance.allocated = allocated;
    balance.remaining = allocated - balance.used - balance.pending;
    await balance.save();
  } else {
    // Create new balance record
    balance = await LeaveBalance.create({
      employee: employeeId,
      leaveType: leaveTypeId,
      year: year || new Date().getFullYear(),
      allocated,
      used: 0,
      pending: 0,
      remaining: allocated,
    });
  }

  await balance.populate("leaveType", "name code");

  res.status(200).json({
    success: true,
    message: "Leave balance allocated successfully.",
    balance,
  });
});

// @desc    Allocate leave balances to ALL active employees at once
// @route   POST /api/leaves/balances/allocate-all
// @access  Super Admin, HR Manager
exports.allocateToAllEmployees = asyncHandler(async (req, res, next) => {
  const { leaveTypeId, year, allocated } = req.body;

  // Get all active employees
  const employees = await Employee.find({ status: "Active" }).select("_id");
  if (employees.length === 0) {
    return next(new ErrorHandler("No active employees found.", 404));
  }

  const leaveType = await LeaveType.findById(leaveTypeId);
  if (!leaveType) {
    return next(new ErrorHandler("Leave type not found.", 404));
  }

  const currentYear = year || new Date().getFullYear();
  let created = 0;
  let updated = 0;

  // Loop through all employees and allocate
  for (const emp of employees) {
    const existing = await LeaveBalance.findOne({
      employee: emp._id,
      leaveType: leaveTypeId,
      year: currentYear,
    });

    if (existing) {
      existing.allocated = allocated;
      existing.remaining = allocated - existing.used - existing.pending;
      await existing.save();
      updated++;
    } else {
      await LeaveBalance.create({
        employee: emp._id,
        leaveType: leaveTypeId,
        year: currentYear,
        allocated,
        used: 0,
        pending: 0,
        remaining: allocated,
      });
      created++;
    }
  }

  res.status(200).json({
    success: true,
    message: `Leave balance allocated to ${employees.length} employees.`,
    created,
    updated,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE REQUESTS
// ─────────────────────────────────────────────────────────────────────────────

// Helper: calculate working days between two dates
// Excludes weekends (Saturday and Sunday)
const calculateWorkingDays = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const day = current.getDay();
    // 0 = Sunday, 6 = Saturday — skip weekends
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
};

// @desc    Submit a leave request
// @route   POST /api/leaves/requests
// @access  Private (any employee)
exports.submitLeaveRequest = asyncHandler(async (req, res, next) => {
  const { leaveTypeId, startDate, endDate, reason } = req.body;

  // Get the employee profile of the logged-in user
  const employee = await Employee.findById(req.user.employee?._id);
  if (!employee) {
    return next(
      new ErrorHandler("Employee profile not found for this account.", 404),
    );
  }

  // Calculate total working days
  const totalDays = calculateWorkingDays(startDate, endDate);
  if (totalDays <= 0) {
    return next(
      new ErrorHandler(
        "Invalid date range. End date must be after start date.",
        400,
      ),
    );
  }

  const year = new Date(startDate).getFullYear();

  // Check leave balance
  const balance = await LeaveBalance.findOne({
    employee: employee._id,
    leaveType: leaveTypeId,
    year,
  });

  if (!balance) {
    return next(
      new ErrorHandler("No leave balance found for this leave type.", 400),
    );
  }

  if (balance.remaining < totalDays) {
    return next(
      new ErrorHandler(
        `Insufficient leave balance. You have ${balance.remaining} days remaining but requested ${totalDays} days.`,
        400,
      ),
    );
  }

  // Check for overlapping leave requests
  const overlap = await LeaveRequest.findOne({
    employee: employee._id,
    status: { $nin: ["Rejected", "Cancelled"] },
    $or: [
      { startDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
      { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
    ],
  });

  if (overlap) {
    return next(
      new ErrorHandler(
        "You already have a leave request overlapping these dates.",
        400,
      ),
    );
  }

  // Create leave request
  const leaveRequest = await LeaveRequest.create({
    employee: employee._id,
    leaveType: leaveTypeId,
    startDate,
    endDate,
    totalDays,
    reason,
    status: "Pending",
  });

  // Mark days as pending in balance
  balance.pending += totalDays;
  balance.remaining -= totalDays;
  await balance.save();

  await leaveRequest.populate("leaveType", "name code isPaid");

  res.status(201).json({
    success: true,
    message: `Leave request submitted for ${totalDays} working day(s).`,
    leaveRequest,
  });
});

// @desc    Get all leave requests (with filters)
// @route   GET /api/leaves/requests
// @access  Private
exports.getLeaveRequests = asyncHandler(async (req, res) => {
  const { status, department, employeeId, year } = req.query;

  const filter = {};

  // Employees only see their own requests
  if (req.user.role === "employee") {
    filter.employee = req.user.employee?._id;
  } else if (employeeId) {
    filter.employee = employeeId;
  }

  // HOD only sees requests from their department employees
  if (req.user.role === "hod") {
    const deptEmployees = await Employee.find({
      department: req.user.employee?.department,
    }).select("_id");
    filter.employee = { $in: deptEmployees.map((e) => e._id) };
  }

  if (status) filter.status = status;

  // Filter by year
  if (year) {
    filter.startDate = {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    };
  }

  const requests = await LeaveRequest.find(filter)
    .populate("employee", "firstName lastName employeeCode department photo")
    .populate("leaveType", "name code isPaid")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

// @desc    Get single leave request
// @route   GET /api/leaves/requests/:id
// @access  Private
exports.getLeaveRequest = asyncHandler(async (req, res, next) => {
  const request = await LeaveRequest.findById(req.params.id)
    .populate("employee", "firstName lastName employeeCode department")
    .populate("leaveType", "name code isPaid requiresProof");

  if (!request) {
    return next(new ErrorHandler("Leave request not found.", 404));
  }

  res.status(200).json({ success: true, request });
});

// @desc    HOD approves or rejects a leave request (first level)
// @route   PUT /api/leaves/requests/:id/hod-action
// @access  HOD only
exports.hodAction = asyncHandler(async (req, res, next) => {
  const { action, remarks } = req.body;
  // action must be 'approve' or 'reject'

  if (!["approve", "reject"].includes(action)) {
    return next(new ErrorHandler("Action must be approve or reject.", 400));
  }

  const request = await LeaveRequest.findById(req.params.id);
  if (!request) {
    return next(new ErrorHandler("Leave request not found.", 404));
  }

  if (request.status !== "Pending") {
    return next(
      new ErrorHandler("This request has already been processed.", 400),
    );
  }

  if (action === "approve") {
    // HOD approves — moves to HR for final approval
    request.status = "Approved by HOD";
    request.hodApproval = {
      approvedBy: req.user._id,
      date: new Date(),
      remarks: remarks || "Approved by HOD",
    };
  } else {
    // HOD rejects — restore balance
    request.status = "Rejected";
    request.rejectedBy = req.user._id;
    request.rejectedReason = remarks || "Rejected by HOD";

    // Restore leave balance
    await restoreBalance(request);
  }

  await request.save();

  res.status(200).json({
    success: true,
    message: `Leave request ${action === "approve" ? "approved by HOD" : "rejected"}.`,
    request,
  });
});

// @desc    HR Manager gives final approval or rejection
// @route   PUT /api/leaves/requests/:id/hr-action
// @access  HR Manager, Super Admin
exports.hrAction = asyncHandler(async (req, res, next) => {
  const { action, remarks } = req.body;

  if (!["approve", "reject"].includes(action)) {
    return next(new ErrorHandler("Action must be approve or reject.", 400));
  }

  const request = await LeaveRequest.findById(req.params.id);
  if (!request) {
    return next(new ErrorHandler("Leave request not found.", 404));
  }

  // HR can approve requests that are Pending or Approved by HOD
  if (!["Pending", "Approved by HOD"].includes(request.status)) {
    return next(
      new ErrorHandler("This request has already been processed.", 400),
    );
  }

  if (action === "approve") {
    request.status = "Approved";
    request.hrApproval = {
      approvedBy: req.user._id,
      date: new Date(),
      remarks: remarks || "Approved by HR",
    };

    // Move days from pending to used in balance
    const year = new Date(request.startDate).getFullYear();
    const balance = await LeaveBalance.findOne({
      employee: request.employee,
      leaveType: request.leaveType,
      year,
    });

    if (balance) {
      balance.pending -= request.totalDays;
      balance.used += request.totalDays;
      await balance.save();
    }

    // Update employee status to On-Leave
    await Employee.findByIdAndUpdate(request.employee, { status: "On-Leave" });
  } else {
    request.status = "Rejected";
    request.rejectedBy = req.user._id;
    request.rejectedReason = remarks || "Rejected by HR";

    // Restore leave balance
    await restoreBalance(request);
  }

  await request.save();

  res.status(200).json({
    success: true,
    message: `Leave request ${action === "approve" ? "finally approved" : "rejected"} by HR.`,
    request,
  });
});

// @desc    Employee cancels their own pending request
// @route   PUT /api/leaves/requests/:id/cancel
// @access  Employee (own request only)
exports.cancelLeaveRequest = asyncHandler(async (req, res, next) => {
  const request = await LeaveRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorHandler("Leave request not found.", 404));
  }

  // Only the owner can cancel
  if (request.employee.toString() !== req.user.employee?._id.toString()) {
    return next(
      new ErrorHandler("Not authorized to cancel this request.", 403),
    );
  }

  // Can only cancel if still pending
  if (!["Pending", "Approved by HOD"].includes(request.status)) {
    return next(
      new ErrorHandler("Only pending requests can be cancelled.", 400),
    );
  }

  request.status = "Cancelled";
  await request.save();

  // Restore leave balance
  await restoreBalance(request);

  res.status(200).json({
    success: true,
    message: "Leave request cancelled and balance restored.",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Restore balance when request is rejected or cancelled
// ─────────────────────────────────────────────────────────────────────────────
const restoreBalance = async (request) => {
  const year = new Date(request.startDate).getFullYear();
  const balance = await LeaveBalance.findOne({
    employee: request.employee,
    leaveType: request.leaveType,
    year,
  });

  if (balance) {
    // Move days back from pending to remaining
    balance.pending = Math.max(0, balance.pending - request.totalDays);
    balance.remaining += request.totalDays;
    await balance.save();
  }
};
