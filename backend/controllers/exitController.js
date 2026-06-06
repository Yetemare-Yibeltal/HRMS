// controllers/exitController.js
// Handles employee exit process:
// resignation/termination, clearance, final settlement, and exit interview

const Exit = require("../models/Exit");
const Employee = require("../models/Employee");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

// @desc    Get all exit records
// @route   GET /api/exit
// @access  Super Admin, HR Manager
exports.getExits = asyncHandler(async (req, res) => {
  const { status, type } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  const exits = await Exit.find(filter)
    .populate("employee", "firstName lastName employeeCode department photo")
    .populate("processedBy", "email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: exits.length,
    exits,
  });
});

// @desc    Get single exit record
// @route   GET /api/exit/:id
// @access  Super Admin, HR Manager
exports.getExit = asyncHandler(async (req, res, next) => {
  const exit = await Exit.findById(req.params.id)
    .populate({
      path: "employee",
      select:
        "firstName lastName employeeCode department position dateOfJoining basicSalary",
      populate: [
        { path: "department", select: "name" },
        { path: "position", select: "title" },
      ],
    })
    .populate("processedBy", "email")
    .populate("exitInterview.conductedBy", "email");

  if (!exit) {
    return next(new ErrorHandler("Exit record not found.", 404));
  }

  res.status(200).json({ success: true, exit });
});

// @desc    Initiate exit process for an employee
// @route   POST /api/exit
// @access  Super Admin, HR Manager
exports.initiateExit = asyncHandler(async (req, res, next) => {
  const { employeeId, type, exitDate, noticeDate, reason } = req.body;

  if (!employeeId || !type || !exitDate) {
    return next(
      new ErrorHandler(
        "Employee ID, exit type, and exit date are required.",
        400,
      ),
    );
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  // Check if exit process already initiated
  const existing = await Exit.findOne({
    employee: employeeId,
    status: { $nin: ["Completed"] },
  });

  if (existing) {
    return next(
      new ErrorHandler(
        "An active exit process already exists for this employee.",
        400,
      ),
    );
  }

  // Calculate pending leave days for settlement
  const { LeaveBalance } = require("../models/Leave");
  const currentYear = new Date().getFullYear();

  const leaveBalances = await LeaveBalance.find({
    employee: employeeId,
    year: currentYear,
  });

  const pendingLeaveDays = leaveBalances.reduce(
    (sum, b) => sum + (b.remaining || 0),
    0,
  );

  // Daily rate for leave encashment
  const dailyRate = employee.basicSalary / 30;
  const leaveEncashment = parseFloat((pendingLeaveDays * dailyRate).toFixed(2));

  const exit = await Exit.create({
    employee: employeeId,
    type,
    exitDate,
    noticeDate: noticeDate || null,
    reason: reason || "",
    settlement: {
      pendingLeaveDays,
      leaveEncashment,
      gratuity: 0,
      otherDues: 0,
      totalSettlement: leaveEncashment,
      settlementStatus: "Pending",
    },
    status: "Initiated",
    processedBy: req.user._id,
  });

  // Update employee status
  employee.status = "Inactive";
  await employee.save();

  await exit.populate("employee", "firstName lastName employeeCode");

  res.status(201).json({
    success: true,
    message: `Exit process initiated for ${employee.firstName} ${employee.lastName}.`,
    exit,
  });
});

// @desc    Update clearance status for a department
// @route   PUT /api/exit/:id/clearance
// @access  Super Admin, HR Manager
exports.updateClearance = asyncHandler(async (req, res, next) => {
  const { library, it, finance, hostel, hr } = req.body;

  const exit = await Exit.findById(req.params.id);
  if (!exit) {
    return next(new ErrorHandler("Exit record not found.", 404));
  }

  // Update each clearance department that was provided
  if (library) exit.clearance.library = library;
  if (it) exit.clearance.it = it;
  if (finance) exit.clearance.finance = finance;
  if (hostel) exit.clearance.hostel = hostel;
  if (hr) exit.clearance.hr = hr;

  // Check if all departments have cleared
  const allCleared = [
    exit.clearance.library?.cleared,
    exit.clearance.it?.cleared,
    exit.clearance.finance?.cleared,
    exit.clearance.hostel?.cleared,
    exit.clearance.hr?.cleared,
  ].every((c) => c === true);

  if (allCleared) {
    exit.status = "Clearance Done";
  } else {
    exit.status = "In Progress";
  }

  await exit.save();

  res.status(200).json({
    success: true,
    message: allCleared ? "All clearances completed." : "Clearance updated.",
    exit,
  });
});

// @desc    Update final settlement
// @route   PUT /api/exit/:id/settlement
// @access  Super Admin, HR Manager, Payroll Officer
exports.updateSettlement = asyncHandler(async (req, res, next) => {
  const { gratuity, otherDues, settlementDate, settlementStatus } = req.body;

  const exit = await Exit.findById(req.params.id);
  if (!exit) {
    return next(new ErrorHandler("Exit record not found.", 404));
  }

  // Update settlement amounts
  if (gratuity !== undefined) exit.settlement.gratuity = gratuity;
  if (otherDues !== undefined) exit.settlement.otherDues = otherDues;

  // Recalculate total settlement
  exit.settlement.totalSettlement = parseFloat(
    (
      (exit.settlement.leaveEncashment || 0) +
      (exit.settlement.gratuity || 0) +
      (exit.settlement.otherDues || 0)
    ).toFixed(2),
  );

  if (settlementDate) exit.settlement.settlementDate = settlementDate;
  if (settlementStatus) exit.settlement.settlementStatus = settlementStatus;

  await exit.save();

  res.status(200).json({
    success: true,
    message: "Settlement updated.",
    settlement: exit.settlement,
  });
});

// @desc    Record exit interview
// @route   PUT /api/exit/:id/interview
// @access  Super Admin, HR Manager
exports.recordExitInterview = asyncHandler(async (req, res, next) => {
  const { responses, overallRating } = req.body;

  const exit = await Exit.findById(req.params.id);
  if (!exit) {
    return next(new ErrorHandler("Exit record not found.", 404));
  }

  exit.exitInterview = {
    conductedBy: req.user._id,
    date: new Date(),
    responses: responses || {},
    overallRating: overallRating || null,
  };

  await exit.save();

  res.status(200).json({
    success: true,
    message: "Exit interview recorded.",
    exitInterview: exit.exitInterview,
  });
});

// @desc    Complete exit process and generate letters
// @route   PUT /api/exit/:id/complete
// @access  Super Admin, HR Manager
exports.completeExit = asyncHandler(async (req, res, next) => {
  const { experienceLetterUrl, relievingLetterUrl } = req.body;

  const exit = await Exit.findById(req.params.id).populate("employee");

  if (!exit) {
    return next(new ErrorHandler("Exit record not found.", 404));
  }

  if (exit.status !== "Clearance Done") {
    return next(
      new ErrorHandler(
        "All clearances must be completed before finishing exit.",
        400,
      ),
    );
  }

  // Update document URLs
  if (experienceLetterUrl) exit.experienceLetterUrl = experienceLetterUrl;
  if (relievingLetterUrl) exit.relievingLetterUrl = relievingLetterUrl;

  exit.status = "Completed";
  await exit.save();

  // Permanently update employee status to Terminated
  await Employee.findByIdAndUpdate(exit.employee._id, {
    status: "Terminated",
  });

  // Deactivate user account
  await User.findOneAndUpdate(
    { employee: exit.employee._id },
    { isActive: false },
  );

  res.status(200).json({
    success: true,
    message: `Exit process completed for ${exit.employee.firstName} ${exit.employee.lastName}. Account deactivated.`,
    exit,
  });
});

// @desc    Get exit stats
// @route   GET /api/exit/stats
// @access  Super Admin, HR Manager
exports.getExitStats = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();

  const [totalThisYear, byType, byStatus, pendingSettlements] =
    await Promise.all([
      // Total exits this year
      Exit.countDocuments({
        exitDate: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      }),

      // By exit type
      Exit.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),

      // By status
      Exit.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),

      // Pending settlement payments
      Exit.countDocuments({
        "settlement.settlementStatus": "Pending",
      }),
    ]);

  res.status(200).json({
    success: true,
    stats: {
      totalThisYear,
      byType,
      byStatus,
      pendingSettlements,
    },
  });
});
