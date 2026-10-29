// controllers/payrollController.js
// Handles salary structures, monthly payroll processing,
// payslip generation, and payroll reports

const { SalaryStructure, Payroll } = require("../models/Payroll");
const { Attendance } = require("../models/Attendance");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");
const { calculatePayroll } = require("../utils/taxCalculator");

// ─────────────────────────────────────────────────────────────────────────────
// SALARY STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all salary structures
// @route   GET /api/payroll/structures
// @access  Super Admin, HR Manager, Payroll Officer
exports.getSalaryStructures = asyncHandler(async (req, res) => {
  const structures = await SalaryStructure.find({ status: "Active" }).sort({
    grade: 1,
  });

  res.status(200).json({
    success: true,
    count: structures.length,
    structures,
  });
});

// @desc    Create salary structure
// @route   POST /api/payroll/structures
// @access  Super Admin, HR Manager
exports.createSalaryStructure = asyncHandler(async (req, res, next) => {
  const { grade, basicSalary, allowances, deductions } = req.body;

  if (!grade || !basicSalary) {
    return next(new ErrorHandler("Grade and basic salary are required.", 400));
  }

  // Check for duplicate grade
  const existing = await SalaryStructure.findOne({ grade });
  if (existing) {
    return next(
      new ErrorHandler(
        `Salary structure for grade "${grade}" already exists.`,
        400,
      ),
    );
  }

  const structure = await SalaryStructure.create({
    grade,
    basicSalary,
    allowances: allowances || [],
    deductions: deductions || [],
  });

  res.status(201).json({
    success: true,
    message: "Salary structure created.",
    structure,
  });
});

// @desc    Update salary structure
// @route   PUT /api/payroll/structures/:id
// @access  Super Admin, HR Manager
exports.updateSalaryStructure = asyncHandler(async (req, res, next) => {
  const structure = await SalaryStructure.findById(req.params.id);
  if (!structure) {
    return next(new ErrorHandler("Salary structure not found.", 404));
  }

  const updated = await SalaryStructure.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  res.status(200).json({
    success: true,
    message: "Salary structure updated.",
    structure: updated,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PAYROLL PROCESSING
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Process payroll for a single employee
// @route   POST /api/payroll/process/single
// @access  Super Admin, Payroll Officer
exports.processSinglePayroll = asyncHandler(async (req, res, next) => {
  const {
    employeeId,
    month,
    year,
    bonuses = 0,
    otherDeductions = [],
  } = req.body;

  if (!employeeId || !month || !year) {
    return next(
      new ErrorHandler("Employee ID, month, and year are required.", 400),
    );
  }

  // Check if payroll already processed for this month
  const existing = await Payroll.findOne({ employee: employeeId, month, year });
  if (existing && existing.status !== "Draft") {
    return next(
      new ErrorHandler(
        `Payroll for this employee has already been ${existing.status} for ${month}/${year}.`,
        400,
      ),
    );
  }

  // Get employee details
  const employee = await Employee.findById(employeeId)
    .populate("department", "name")
    .populate("position", "title grade");

  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  if (employee.status !== "Active" && employee.status !== "On-Leave") {
    return next(
      new ErrorHandler("Cannot process payroll for inactive employee.", 400),
    );
  }

  // ── Get overtime hours from attendance ────────────────────────────────────
  const attendanceRecords = await Attendance.find({
    employee: employeeId,
    date: {
      $gte: new Date(`${year}-${month.toString().padStart(2, "0")}-01`),
      $lte: new Date(`${year}-${month.toString().padStart(2, "0")}-31`),
    },
  });

  const totalOvertimeHours = attendanceRecords.reduce(
    (sum, r) => sum + (r.overtimeHours || 0),
    0,
  );

  // ── Get unpaid leave days ─────────────────────────────────────────────────
  // Count absent days from attendance as potential unpaid leave
  const absentDays = attendanceRecords.filter(
    (r) => r.status === "Absent",
  ).length;

  // ── Build allowances from salary structure ────────────────────────────────
  let allowances = [];
  if (employee.salaryGrade) {
    const structure = await SalaryStructure.findOne({
      grade: employee.salaryGrade,
    });
    if (structure) {
      allowances = structure.allowances.map((a) => ({
        name: a.name,
        amount:
          a.type === "Percentage"
            ? (employee.basicSalary * a.amount) / 100
            : a.amount,
      }));
    }
  }

  // ── Run payroll calculation ───────────────────────────────────────────────
  const calculated = calculatePayroll({
    basicSalary: employee.basicSalary,
    allowances,
    overtimeHours: totalOvertimeHours,
    bonuses,
    unpaidLeaveDays: absentDays,
    otherDeductions,
  });

  // ── Save or update payroll record ────────────────────────────────────────
  const payPeriod = new Date(
    `${year}-${month.toString().padStart(2, "0")}-01`,
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const payrollData = {
    employee: employeeId,
    month,
    year,
    payPeriod,
    basicSalary: calculated.basicSalary,
    allowances: allowances,
    overtimePay: calculated.overtimePay,
    bonuses,
    grossSalary: calculated.grossSalary,
    incomeTax: calculated.incomeTax,
    pensionEmployee: calculated.pensionEmployee,
    pensionEmployer: calculated.pensionEmployer,
    otherDeductions,
    totalDeductions: calculated.totalDeductions,
    netSalary: calculated.netSalary,
    unpaidLeaveDays: calculated.unpaidLeaveDays,
    unpaidLeaveAmount: calculated.unpaidLeaveAmount,
    processedBy: req.user._id,
    status: "Draft",
  };

  let payroll;
  if (existing) {
    // Update existing draft
    payroll = await Payroll.findByIdAndUpdate(existing._id, payrollData, {
      new: true,
    });
  } else {
    payroll = await Payroll.create(payrollData);
  }

  await payroll.populate(
    "employee",
    "firstName lastName employeeCode bankName bankAccountNumber",
  );

  res.status(201).json({
    success: true,
    message: `Payroll processed for ${employee.firstName} ${employee.lastName} — Net: ETB ${calculated.netSalary}`,
    payroll,
  });
});

// @desc    Process payroll for ALL active employees at once
// @route   POST /api/payroll/process/all
// @access  Super Admin, Payroll Officer
exports.processAllPayroll = asyncHandler(async (req, res, next) => {
  const { month, year } = req.body;

  if (!month || !year) {
    return next(new ErrorHandler("Month and year are required.", 400));
  }

  // Get all active employees
  const employees = await Employee.find({
    status: { $in: ["Active", "On-Leave"] },
  });

  if (employees.length === 0) {
    return next(new ErrorHandler("No active employees found.", 404));
  }

  const results = {
    processed: [],
    skipped: [],
    errors: [],
  };

  // Process each employee
  for (const employee of employees) {
    try {
      // Skip if already approved or paid
      const existing = await Payroll.findOne({
        employee: employee._id,
        month,
        year,
      });

      if (existing && existing.status !== "Draft") {
        results.skipped.push({
          employee: `${employee.firstName} ${employee.lastName}`,
          reason: `Already ${existing.status}`,
        });
        continue;
      }

      // Get overtime from attendance
      const attendanceRecords = await Attendance.find({
        employee: employee._id,
        date: {
          $gte: new Date(`${year}-${month.toString().padStart(2, "0")}-01`),
          $lte: new Date(`${year}-${month.toString().padStart(2, "0")}-31`),
        },
      });

      const totalOvertimeHours = attendanceRecords.reduce(
        (sum, r) => sum + (r.overtimeHours || 0),
        0,
      );

      const absentDays = attendanceRecords.filter(
        (r) => r.status === "Absent",
      ).length;

      // Get allowances
      let allowances = [];
      if (employee.salaryGrade) {
        const structure = await SalaryStructure.findOne({
          grade: employee.salaryGrade,
        });
        if (structure) {
          allowances = structure.allowances.map((a) => ({
            name: a.name,
            amount:
              a.type === "Percentage"
                ? (employee.basicSalary * a.amount) / 100
                : a.amount,
          }));
        }
      }

      // Calculate payroll
      const calculated = calculatePayroll({
        basicSalary: employee.basicSalary,
        allowances,
        overtimeHours: totalOvertimeHours,
        bonuses: 0,
        unpaidLeaveDays: absentDays,
        otherDeductions: [],
      });

      const payPeriod = new Date(
        `${year}-${month.toString().padStart(2, "0")}-01`,
      ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

      const payrollData = {
        employee: employee._id,
        month,
        year,
        payPeriod,
        basicSalary: calculated.basicSalary,
        allowances,
        overtimePay: calculated.overtimePay,
        bonuses: 0,
        grossSalary: calculated.grossSalary,
        incomeTax: calculated.incomeTax,
        pensionEmployee: calculated.pensionEmployee,
        pensionEmployer: calculated.pensionEmployer,
        otherDeductions: [],
        totalDeductions: calculated.totalDeductions,
        netSalary: calculated.netSalary,
        unpaidLeaveDays: calculated.unpaidLeaveDays,
        unpaidLeaveAmount: calculated.unpaidLeaveAmount,
        processedBy: req.user._id,
        status: "Draft",
      };

      if (existing) {
        await Payroll.findByIdAndUpdate(existing._id, payrollData);
      } else {
        await Payroll.create(payrollData);
      }

      results.processed.push({
        employee: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        netSalary: calculated.netSalary,
      });
    } catch (error) {
      // Log error but continue processing others
      results.errors.push({
        employee: `${employee.firstName} ${employee.lastName}`,
        error: error.message,
      });
    }
  }

  res.status(200).json({
    success: true,
    message: `Payroll processed for ${results.processed.length} employees.`,
    results,
  });
});

// @desc    Approve payroll (moves from Draft to Approved)
// @route   PUT /api/payroll/:id/approve
// @access  Super Admin, HR Manager
exports.approvePayroll = asyncHandler(async (req, res, next) => {
  const payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    return next(new ErrorHandler("Payroll record not found.", 404));
  }

  if (payroll.status !== "Draft") {
    return next(new ErrorHandler(`Payroll is already ${payroll.status}.`, 400));
  }

  payroll.status = "Approved";
  payroll.approvedBy = req.user._id;
  await payroll.save();

  res.status(200).json({
    success: true,
    message: "Payroll approved.",
    payroll,
  });
});

// @desc    Mark payroll as paid
// @route   PUT /api/payroll/:id/mark-paid
// @access  Super Admin, Payroll Officer
exports.markAsPaid = asyncHandler(async (req, res, next) => {
  const { paymentDate, paymentMethod } = req.body;

  const payroll = await Payroll.findById(req.params.id);
  if (!payroll) {
    return next(new ErrorHandler("Payroll record not found.", 404));
  }

  if (payroll.status !== "Approved") {
    return next(
      new ErrorHandler("Payroll must be approved before marking as paid.", 400),
    );
  }

  payroll.status = "Paid";
  payroll.paymentDate = paymentDate || new Date();
  payroll.paymentMethod = paymentMethod || "Bank Transfer";
  await payroll.save();

  res.status(200).json({
    success: true,
    message: "Payroll marked as paid.",
    payroll,
  });
});

// @desc    Get all payroll records with filters
// @route   GET /api/payroll
// @access  Super Admin, HR Manager, Payroll Officer
exports.getPayrolls = asyncHandler(async (req, res) => {
  const { month, year, status, employeeId } = req.query;

  const filter = {};
  if (month) filter.month = parseInt(month);
  if (year) filter.year = parseInt(year);
  if (status) filter.status = status;
  if (employeeId) filter.employee = employeeId;

  const payrolls = await Payroll.find(filter)
    .populate(
      "employee",
      "firstName lastName employeeCode department bankName bankAccountNumber",
    )
    .sort({ createdAt: -1 });

  // Calculate totals for the filtered set
  const totals = payrolls.reduce(
    (acc, p) => {
      acc.grossSalary += p.grossSalary || 0;
      acc.totalDeductions += p.totalDeductions || 0;
      acc.netSalary += p.netSalary || 0;
      acc.pensionEmployer += p.pensionEmployer || 0;
      return acc;
    },
    { grossSalary: 0, totalDeductions: 0, netSalary: 0, pensionEmployer: 0 },
  );

  res.status(200).json({
    success: true,
    count: payrolls.length,
    totals: {
      grossSalary: parseFloat(totals.grossSalary.toFixed(2)),
      totalDeductions: parseFloat(totals.totalDeductions.toFixed(2)),
      netSalary: parseFloat(totals.netSalary.toFixed(2)),
      pensionEmployer: parseFloat(totals.pensionEmployer.toFixed(2)),
    },
    payrolls,
  });
});

// @desc    Get single payroll (payslip)
// @route   GET /api/payroll/:id
// @access  Private (employee sees own, HR sees all)
exports.getPayroll = asyncHandler(async (req, res, next) => {
  const payroll = await Payroll.findById(req.params.id)
    .populate({
      path: "employee",
      select:
        "firstName lastName employeeCode photo bankName bankAccountNumber department position",
      populate: [
        { path: "department", select: "name" },
        { path: "position", select: "title" },
      ],
    })
    .populate("processedBy", "email")
    .populate("approvedBy", "email");

  if (!payroll) {
    return next(new ErrorHandler("Payroll record not found.", 404));
  }

  // Employees can only view their own payslip
  if (
    req.user.role === "employee" &&
    payroll.employee._id.toString() !== req.user.employee?._id.toString()
  ) {
    return next(new ErrorHandler("Not authorized to view this payslip.", 403));
  }

  res.status(200).json({ success: true, payroll });
});

// @desc    Get employee's own payslip history
// @route   GET /api/payroll/my-payslips
// @access  Private (any employee)
exports.getMyPayslips = asyncHandler(async (req, res, next) => {
  if (!req.user.employee) {
    return next(
      new ErrorHandler("No employee profile linked to this account.", 404),
    );
  }

  const payslips = await Payroll.find({
    employee: req.user.employee._id,
    status: "Paid",
  }).sort({ year: -1, month: -1 });

  res.status(200).json({
    success: true,
    count: payslips.length,
    payslips,
  });
});

// @desc    Get payroll summary report for a month
// @route   GET /api/payroll/report
// @access  Super Admin, HR Manager, Payroll Officer
exports.getPayrollReport = asyncHandler(async (req, res, next) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return next(new ErrorHandler("Month and year are required.", 400));
  }

  // Department-wise payroll summary
  const report = await Payroll.aggregate([
    {
      $match: {
        month: parseInt(month),
        year: parseInt(year),
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employeeData",
      },
    },
    { $unwind: "$employeeData" },
    {
      $lookup: {
        from: "departments",
        localField: "employeeData.department",
        foreignField: "_id",
        as: "deptData",
      },
    },
    { $unwind: "$deptData" },
    {
      $group: {
        _id: "$deptData._id",
        department: { $first: "$deptData.name" },
        employeeCount: { $sum: 1 },
        totalGross: { $sum: "$grossSalary" },
        totalNet: { $sum: "$netSalary" },
        totalTax: { $sum: "$incomeTax" },
        totalPensionEmp: { $sum: "$pensionEmployee" },
        totalPensionEmployer: { $sum: "$pensionEmployer" },
        totalDeductions: { $sum: "$totalDeductions" },
      },
    },
    { $sort: { department: 1 } },
  ]);

  // Overall totals
  const totals = report.reduce(
    (acc, r) => {
      acc.employees += r.employeeCount;
      acc.gross += r.totalGross;
      acc.net += r.totalNet;
      acc.tax += r.totalTax;
      acc.pensionEmp += r.totalPensionEmp;
      acc.pensionEmplr += r.totalPensionEmployer;
      return acc;
    },
    { employees: 0, gross: 0, net: 0, tax: 0, pensionEmp: 0, pensionEmplr: 0 },
  );

  res.status(200).json({
    success: true,
    period: `${month}/${year}`,
    totals,
    departmentBreakdown: report,
  });
});
