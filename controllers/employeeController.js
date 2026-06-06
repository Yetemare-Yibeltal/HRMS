// controllers/employeeController.js
// Full CRUD for employee master data.
// Includes photo upload, document upload, search, filter, pagination.

const Employee = require("../models/Employee");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");
const generateEmployeeCode = require("../utils/generateEmployeeCode");

// ── @desc    Get all employees with search, filter, pagination
// ── @route   GET /api/employees
// ── @access  Private (super_admin, hr_manager, hod)
exports.getEmployees = asyncHandler(async (req, res) => {
  const {
    search, // search by name or code
    department, // filter by department ID
    status, // filter by status
    employmentType, // filter by type
    page = 1, // pagination page number
    limit = 10, // results per page
  } = req.query;

  // ── Build filter object ────────────────────────────────────────────────────
  const filter = {};

  // HOD can only see employees in their own department
  if (req.user.role === "hod" && req.user.employee) {
    filter.department = req.user.employee.department;
  } else if (department) {
    filter.department = department;
  }

  if (status) filter.status = status;
  if (employmentType) filter.employmentType = employmentType;

  // Search by name or employee code (case-insensitive)
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { middleName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { employeeCode: { $regex: search, $options: "i" } },
      { workEmail: { $regex: search, $options: "i" } },
    ];
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // ── Query ──────────────────────────────────────────────────────────────────
  const total = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter)
    .populate("department", "name code")
    .populate("position", "title grade")
    .select("-documents -employmentHistory") // exclude heavy fields from list
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: employees.length,
    total,
    pages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    employees,
  });
});

// ── @desc    Get single employee (full profile)
// ── @route   GET /api/employees/:id
// ── @access  Private
exports.getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id)
    .populate("department", "name code description")
    .populate("position", "title grade minSalary maxSalary")
    .populate("userId", "email role lastLogin isActive");

  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  // Regular employees can only view their own profile
  if (
    req.user.role === "employee" &&
    req.user.employee?._id.toString() !== req.params.id
  ) {
    return next(new ErrorHandler("Not authorized to view this profile.", 403));
  }

  res.status(200).json({ success: true, employee });
});

// ── @desc    Create new employee
// ── @route   POST /api/employees
// ── @access  Super Admin, HR Manager
exports.createEmployee = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    middleName,
    lastName,
    gender,
    dateOfBirth,
    department,
    position,
    employmentType,
    dateOfJoining,
    basicSalary,
    salaryGrade,
    workEmail,
    phone,
    title,
    academicRank,
    specialization,
    nationalId,
    tinNumber,
    bankName,
    bankAccountNumber,
    bankBranch,
  } = req.body;

  // Validate required fields
  if (
    !firstName ||
    !lastName ||
    !gender ||
    !department ||
    !employmentType ||
    !dateOfJoining
  ) {
    return next(new ErrorHandler("Please fill all required fields.", 400));
  }

  // Check duplicate work email if provided
  if (workEmail) {
    const emailExists = await Employee.findOne({ workEmail });
    if (emailExists) {
      return next(new ErrorHandler("Work email already in use.", 400));
    }
  }

  // Auto-generate employee code
  const employeeCode = await generateEmployeeCode();

  // Handle profile photo upload
  const photo = req.file ? `/uploads/photos/${req.file.filename}` : "";

  // Create employee
  const employee = await Employee.create({
    employeeCode,
    title,
    firstName,
    middleName,
    lastName,
    gender,
    dateOfBirth,
    nationalId,
    tinNumber,
    workEmail,
    phone,
    department,
    position,
    employmentType,
    dateOfJoining,
    basicSalary,
    salaryGrade,
    academicRank,
    specialization,
    bankName,
    bankAccountNumber,
    bankBranch,
    photo,
  });

  // Populate for response
  await employee.populate("department", "name code");
  await employee.populate("position", "title grade");

  res.status(201).json({
    success: true,
    message: `Employee ${employeeCode} created successfully.`,
    employee,
  });
});

// ── @desc    Update employee
// ── @route   PUT /api/employees/:id
// ── @access  Super Admin, HR Manager
exports.updateEmployee = asyncHandler(async (req, res, next) => {
  let employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  // If a new photo is uploaded, update the photo path
  if (req.file) {
    req.body.photo = `/uploads/photos/${req.file.filename}`;
  }

  employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("department", "name code")
    .populate("position", "title grade");

  res.status(200).json({
    success: true,
    message: "Employee updated successfully.",
    employee,
  });
});

// ── @desc    Upload employee document
// ── @route   POST /api/employees/:id/documents
// ── @access  Super Admin, HR Manager
exports.uploadDocument = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  if (!req.file) {
    return next(new ErrorHandler("Please upload a file.", 400));
  }

  // Add document to employee's documents array
  const document = {
    name: req.body.name || req.file.originalname,
    fileUrl: `/uploads/documents/${req.file.filename}`,
    uploadedAt: new Date(),
  };

  employee.documents.push(document);
  await employee.save();

  res.status(200).json({
    success: true,
    message: "Document uploaded successfully.",
    document,
  });
});

// ── @desc    Add employment history event
// ── @route   POST /api/employees/:id/history
// ── @access  Super Admin, HR Manager
exports.addHistory = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  const { event, from, to, date, remarks } = req.body;

  employee.employmentHistory.push({
    event,
    from,
    to,
    date: date || new Date(),
    remarks,
    recordedBy: req.user._id,
  });

  await employee.save();

  res.status(200).json({
    success: true,
    message: "Employment history recorded.",
    history: employee.employmentHistory,
  });
});

// ── @desc    Delete employee (soft delete — sets status to Terminated)
// ── @route   DELETE /api/employees/:id
// ── @access  Super Admin only
exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(new ErrorHandler("Employee not found.", 404));
  }

  // Soft delete — never permanently remove employee records
  employee.status = "Terminated";
  await employee.save();

  // Deactivate their user account too
  if (employee.userId) {
    await User.findByIdAndUpdate(employee.userId, { isActive: false });
  }

  res.status(200).json({
    success: true,
    message: "Employee terminated and account deactivated.",
  });
});

// ── @desc    Get dashboard stats
// ── @route   GET /api/employees/stats
// ── @access  Super Admin, HR Manager
exports.getStats = asyncHandler(async (req, res) => {
  const [
    totalEmployees,
    activeEmployees,
    onLeave,
    terminated,
    byDepartment,
    byType,
    byGender,
  ] = await Promise.all([
    // Total count
    Employee.countDocuments(),

    // Active employees
    Employee.countDocuments({ status: "Active" }),

    // On leave
    Employee.countDocuments({ status: "On-Leave" }),

    // Terminated this year
    Employee.countDocuments({
      status: "Terminated",
      updatedAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
    }),

    // Group by department
    Employee.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "dept",
        },
      },
      {
        $project: {
          department: { $arrayElemAt: ["$dept.name", 0] },
          count: 1,
        },
      },
    ]),

    // Group by employment type
    Employee.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$employmentType", count: { $sum: 1 } } },
    ]),

    // Group by gender
    Employee.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalEmployees,
      activeEmployees,
      onLeave,
      terminated,
      byDepartment,
      byType,
      byGender,
    },
  });
});
