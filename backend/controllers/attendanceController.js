// controllers/attendanceController.js
// Handles all attendance operations:
// daily logging, work schedules, overtime, and monthly reports

const { Attendance, WorkSchedule } = require("../models/Attendance");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

// ─────────────────────────────────────────────────────────────────────────────
// WORK SCHEDULES
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all work schedules
// @route   GET /api/attendance/schedules
// @access  Private
exports.getWorkSchedules = asyncHandler(async (req, res) => {
  const schedules = await WorkSchedule.find({ status: "Active" });
  res.status(200).json({
    success: true,
    count: schedules.length,
    schedules,
  });
});

// @desc    Create work schedule
// @route   POST /api/attendance/schedules
// @access  Super Admin, HR Manager
exports.createWorkSchedule = asyncHandler(async (req, res, next) => {
  const { name, startTime, endTime, workDays, breakMinutes } = req.body;

  if (!name || !startTime || !endTime) {
    return next(
      new ErrorHandler("Name, start time and end time are required.", 400),
    );
  }

  const schedule = await WorkSchedule.create({
    name,
    startTime,
    endTime,
    workDays: workDays || ["Mon", "Tue", "Wed", "Thu", "Fri"],
    breakMinutes: breakMinutes || 60,
  });

  res.status(201).json({
    success: true,
    message: "Work schedule created.",
    schedule,
  });
});

// @desc    Update work schedule
// @route   PUT /api/attendance/schedules/:id
// @access  Super Admin, HR Manager
exports.updateWorkSchedule = asyncHandler(async (req, res, next) => {
  const schedule = await WorkSchedule.findById(req.params.id);
  if (!schedule) {
    return next(new ErrorHandler("Work schedule not found.", 404));
  }

  const updated = await WorkSchedule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  res.status(200).json({
    success: true,
    message: "Work schedule updated.",
    schedule: updated,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE LOGGING
// ─────────────────────────────────────────────────────────────────────────────

// Helper: calculate total work hours between check-in and check-out
const calculateWorkHours = (checkIn, checkOut, breakMinutes = 60) => {
  if (!checkIn || !checkOut) return 0;

  // Parse time strings e.g. "08:05" → minutes since midnight
  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const inMinutes = toMinutes(checkIn);
  const outMinutes = toMinutes(checkOut);

  if (outMinutes <= inMinutes) return 0;

  // Total minutes worked minus break time
  const totalMinutes = outMinutes - inMinutes - breakMinutes;
  return Math.max(0, parseFloat((totalMinutes / 60).toFixed(2)));
};

// Helper: determine attendance status based on check-in time
const determineStatus = (checkIn, scheduleStart = "08:00") => {
  if (!checkIn) return "Absent";

  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const checkInMinutes = toMinutes(checkIn);
  const scheduleMinutes = toMinutes(scheduleStart);

  // Grace period of 15 minutes before marking as late
  if (checkInMinutes > scheduleMinutes + 15) return "Late";
  return "Present";
};

// Helper: calculate overtime hours (beyond 8 standard hours)
const calculateOvertime = (workHours, standardHours = 8) => {
  return workHours > standardHours
    ? parseFloat((workHours - standardHours).toFixed(2))
    : 0;
};

// @desc    Record check-in for an employee
// @route   POST /api/attendance/checkin
// @access  Private (employee checks themselves in)
exports.checkIn = asyncHandler(async (req, res, next) => {
  const { employeeId, date, checkIn, source } = req.body;

  // HR/Admin can log for any employee, employees log for themselves only
  const targetEmployeeId =
    req.user.role === "employee" ? req.user.employee?._id : employeeId;

  if (!targetEmployeeId) {
    return next(new ErrorHandler("Employee ID is required.", 400));
  }

  const employee = await Employee.findById(targetEmployeeId);
  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  // Use today's date if not provided
  const attendanceDate = date ? new Date(date) : new Date();
  attendanceDate.setHours(0, 0, 0, 0); // normalize to start of day

  // Check if already checked in today
  const existing = await Attendance.findOne({
    employee: targetEmployeeId,
    date: attendanceDate,
  });

  if (existing && existing.checkIn) {
    return next(new ErrorHandler("Already checked in for this date.", 400));
  }

  const checkInTime = checkIn || new Date().toTimeString().slice(0, 5);
  const status = determineStatus(checkInTime);

  let attendance;
  if (existing) {
    // Update existing record with check-in time
    existing.checkIn = checkInTime;
    existing.status = status;
    existing.source = source || "Self-Service";
    await existing.save();
    attendance = existing;
  } else {
    // Create new attendance record for today
    attendance = await Attendance.create({
      employee: targetEmployeeId,
      date: attendanceDate,
      checkIn: checkInTime,
      status,
      source: source || "Self-Service",
      recordedBy: req.user._id,
    });
  }

  res.status(200).json({
    success: true,
    message: `Check-in recorded at ${checkInTime}. Status: ${status}`,
    attendance,
  });
});

// @desc    Record check-out for an employee
// @route   PUT /api/attendance/checkout
// @access  Private
exports.checkOut = asyncHandler(async (req, res, next) => {
  const { employeeId, date, checkOut } = req.body;

  const targetEmployeeId =
    req.user.role === "employee" ? req.user.employee?._id : employeeId;

  const attendanceDate = date ? new Date(date) : new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  // Find today's attendance record
  const attendance = await Attendance.findOne({
    employee: targetEmployeeId,
    date: attendanceDate,
  });

  if (!attendance) {
    return next(
      new ErrorHandler(
        "No check-in found for this date. Please check in first.",
        404,
      ),
    );
  }

  if (attendance.checkOut) {
    return next(new ErrorHandler("Already checked out for this date.", 400));
  }

  const checkOutTime = checkOut || new Date().toTimeString().slice(0, 5);

  // Calculate work hours and overtime
  const workHours = calculateWorkHours(attendance.checkIn, checkOutTime);
  const overtimeHours = calculateOvertime(workHours);

  // Update record with check-out and calculated values
  attendance.checkOut = checkOutTime;
  attendance.workHours = workHours;
  attendance.overtimeHours = overtimeHours;

  // Update status for half day — less than 4 hours worked
  if (workHours < 4 && attendance.status === "Present") {
    attendance.status = "Half-Day";
  }

  await attendance.save();

  res.status(200).json({
    success: true,
    message: `Check-out recorded at ${checkOutTime}. Hours worked: ${workHours}`,
    attendance,
  });
});

// @desc    Manual attendance entry by HR
// @route   POST /api/attendance/manual
// @access  Super Admin, HR Manager
exports.manualEntry = asyncHandler(async (req, res, next) => {
  const { employeeId, date, checkIn, checkOut, status, remarks, source } =
    req.body;

  if (!employeeId || !date) {
    return next(new ErrorHandler("Employee ID and date are required.", 400));
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  // Calculate work hours if both times are provided
  const workHours = calculateWorkHours(checkIn, checkOut);
  const overtimeHours = calculateOvertime(workHours);

  // Upsert — update if exists, create if not
  const attendance = await Attendance.findOneAndUpdate(
    { employee: employeeId, date: attendanceDate },
    {
      employee: employeeId,
      date: attendanceDate,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      workHours,
      overtimeHours,
      status: status || determineStatus(checkIn),
      remarks: remarks || "",
      source: source || "Manual",
      recordedBy: req.user._id,
    },
    { upsert: true, new: true, runValidators: true },
  );

  res.status(200).json({
    success: true,
    message: "Attendance recorded manually.",
    attendance,
  });
});

// @desc    Get attendance records with filters
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = asyncHandler(async (req, res) => {
  const { employeeId, startDate, endDate, status, month, year } = req.query;

  const filter = {};

  // Employees can only see their own records
  if (req.user.role === "employee") {
    filter.employee = req.user.employee?._id;
  } else if (employeeId) {
    filter.employee = employeeId;
  }

  // HOD sees only their department employees
  if (req.user.role === "hod") {
    const deptEmployees = await Employee.find({
      department: req.user.employee?.department,
    }).select("_id");
    filter.employee = { $in: deptEmployees.map((e) => e._id) };
  }

  // Date range filter
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Filter by specific month and year
  if (month && year) {
    filter.date = {
      $gte: new Date(`${year}-${month.padStart(2, "0")}-01`),
      $lte: new Date(`${year}-${month.padStart(2, "0")}-31`),
    };
  }

  if (status) filter.status = status;

  const records = await Attendance.find(filter)
    .populate("employee", "firstName lastName employeeCode department")
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: records.length,
    records,
  });
});

// @desc    Get monthly attendance summary for one employee
// @route   GET /api/attendance/summary/:employeeId
// @access  Private
exports.getMonthlySummary = asyncHandler(async (req, res, next) => {
  const { month, year } = req.query;
  const currentMonth = month || (new Date().getMonth() + 1).toString();
  const currentYear = year || new Date().getFullYear().toString();

  const employee = await Employee.findById(req.params.employeeId).select(
    "firstName lastName employeeCode",
  );
  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  // Get all records for this month
  const records = await Attendance.find({
    employee: req.params.employeeId,
    date: {
      $gte: new Date(`${currentYear}-${currentMonth.padStart(2, "0")}-01`),
      $lte: new Date(`${currentYear}-${currentMonth.padStart(2, "0")}-31`),
    },
  });

  // Calculate summary statistics
  const summary = {
    employee,
    month: currentMonth,
    year: currentYear,
    totalDays: records.length,
    present: records.filter((r) => r.status === "Present").length,
    absent: records.filter((r) => r.status === "Absent").length,
    late: records.filter((r) => r.status === "Late").length,
    halfDay: records.filter((r) => r.status === "Half-Day").length,
    onLeave: records.filter((r) => r.status === "On-Leave").length,
    totalWorkHours: parseFloat(
      records.reduce((sum, r) => sum + (r.workHours || 0), 0).toFixed(2),
    ),
    totalOvertime: parseFloat(
      records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0).toFixed(2),
    ),
    records,
  };

  res.status(200).json({ success: true, summary });
});

// @desc    Get today's attendance overview (for HR dashboard)
// @route   GET /api/attendance/today
// @access  Super Admin, HR Manager, HOD
exports.getTodayOverview = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Total active employees
  const totalEmployees = await Employee.countDocuments({ status: "Active" });

  // Today's records
  const todayRecords = await Attendance.find({
    date: { $gte: today, $lt: tomorrow },
  }).populate("employee", "firstName lastName employeeCode photo department");

  const present = todayRecords.filter((r) => r.status === "Present").length;
  const late = todayRecords.filter((r) => r.status === "Late").length;
  const onLeave = todayRecords.filter((r) => r.status === "On-Leave").length;
  const absent = totalEmployees - todayRecords.length;

  res.status(200).json({
    success: true,
    date: today,
    overview: {
      totalEmployees,
      present,
      late,
      onLeave,
      absent,
      notYetMarked: totalEmployees - todayRecords.length,
    },
    records: todayRecords,
  });
});

// @desc    Get department-wise attendance report
// @route   GET /api/attendance/department-report
// @access  Super Admin, HR Manager
exports.getDepartmentReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const currentMonth = month || (new Date().getMonth() + 1).toString();
  const currentYear = year || new Date().getFullYear().toString();

  // Aggregate attendance by department
  const report = await Attendance.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${currentYear}-${currentMonth.padStart(2, "0")}-01`),
          $lte: new Date(`${currentYear}-${currentMonth.padStart(2, "0")}-31`),
        },
      },
    },
    {
      // Join with employees collection
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employeeData",
      },
    },
    { $unwind: "$employeeData" },
    {
      // Join with departments collection
      $lookup: {
        from: "departments",
        localField: "employeeData.department",
        foreignField: "_id",
        as: "departmentData",
      },
    },
    { $unwind: "$departmentData" },
    {
      $group: {
        _id: "$departmentData._id",
        departmentName: { $first: "$departmentData.name" },
        totalRecords: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
        },
        lateCount: { $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] } },
        totalWorkHours: { $sum: "$workHours" },
        totalOvertime: { $sum: "$overtimeHours" },
      },
    },
    { $sort: { departmentName: 1 } },
  ]);

  res.status(200).json({
    success: true,
    month: currentMonth,
    year: currentYear,
    report,
  });
});
