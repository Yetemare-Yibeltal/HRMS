// controllers/departmentController.js
// Full CRUD for university departments.
// Includes employee count per department.

const Department = require("../models/Department");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");

// ── @desc    Get all departments
// ── @route   GET /api/departments
// ── @access  Private
exports.getDepartments = asyncHandler(async (req, res) => {
  // Populate head of department name
  const departments = await Department.find()
    .populate("headOfDepartment", "firstName lastName employeeCode")
    .populate("parentDepartment", "name code")
    .sort({ name: 1 }); // alphabetical order

  // Add employee count to each department
  const departmentsWithCount = await Promise.all(
    departments.map(async (dept) => {
      const count = await Employee.countDocuments({
        department: dept._id,
        status: "Active",
      });
      return {
        ...dept.toJSON(),
        employeeCount: count,
      };
    }),
  );

  res.status(200).json({
    success: true,
    count: departments.length,
    departments: departmentsWithCount,
  });
});

// ── @desc    Get single department
// ── @route   GET /api/departments/:id
// ── @access  Private
exports.getDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findById(req.params.id)
    .populate("headOfDepartment", "firstName lastName employeeCode photo")
    .populate("parentDepartment", "name code");

  if (!department) {
    return next(new ErrorHandler("Department not found.", 404));
  }

  // Get all employees in this department
  const employees = await Employee.find({
    department: department._id,
    status: "Active",
  })
    .select("firstName lastName employeeCode position photo")
    .populate("position", "title");

  res.status(200).json({
    success: true,
    department: {
      ...department.toJSON(),
      employees,
    },
  });
});

// ── @desc    Create new department
// ── @route   POST /api/departments
// ── @access  Super Admin, HR Manager
exports.createDepartment = asyncHandler(async (req, res, next) => {
  const { name, code, description, budget, parentDepartment } = req.body;

  // Check for duplicate name or code
  const existing = await Department.findOne({
    $or: [{ name }, { code: code?.toUpperCase() }],
  });
  if (existing) {
    return next(
      new ErrorHandler(
        "Department with this name or code already exists.",
        400,
      ),
    );
  }

  const department = await Department.create({
    name,
    code,
    description,
    budget,
    parentDepartment: parentDepartment || null,
  });

  res.status(201).json({
    success: true,
    message: "Department created successfully.",
    department,
  });
});

// ── @desc    Update department
// ── @route   PUT /api/departments/:id
// ── @access  Super Admin, HR Manager
exports.updateDepartment = asyncHandler(async (req, res, next) => {
  let department = await Department.findById(req.params.id);

  if (!department) {
    return next(new ErrorHandler("Department not found.", 404));
  }

  // Update fields
  department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return updated document
    runValidators: true, // run schema validators on update
  });

  res.status(200).json({
    success: true,
    message: "Department updated successfully.",
    department,
  });
});

// ── @desc    Delete department
// ── @route   DELETE /api/departments/:id
// ── @access  Super Admin only
exports.deleteDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    return next(new ErrorHandler("Department not found.", 404));
  }

  // Prevent deletion if employees are assigned to this department
  const employeeCount = await Employee.countDocuments({
    department: req.params.id,
  });
  if (employeeCount > 0) {
    return next(
      new ErrorHandler(
        `Cannot delete. ${employeeCount} employee(s) are assigned to this department.`,
        400,
      ),
    );
  }

  await department.deleteOne();

  res.status(200).json({
    success: true,
    message: "Department deleted successfully.",
  });
});
