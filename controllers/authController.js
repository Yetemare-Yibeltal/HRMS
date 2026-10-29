// controllers/authController.js
// Handles all authentication logic:
// register, login, getMe, changePassword, updateLastLogin

const User = require("../models/User");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");
const generateToken = require("../utils/generateToken");

// ── Helper: build response object ─────────────────────────────────────────────
// Builds a clean user response with token — used in register and login
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      employee: user.employee, // linked employee profile (if any)
    },
  });
};

// ── @desc    Register a new user account
// ── @route   POST /api/auth/register
// ── @access  Super Admin only (after first setup)
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, role, employeeId } = req.body;

  // Validate required fields
  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required.", 400));
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
      new ErrorHandler("An account with this email already exists.", 400),
    );
  }

  // If linking to an employee, verify that employee exists
  if (employeeId) {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return next(new ErrorHandler("Employee not found.", 404));
    }
  }

  // Create the user (password is hashed in the User model pre-save hook)
  const user = await User.create({
    email,
    password,
    role: role || "employee",
    employee: employeeId || null,
  });

  sendTokenResponse(user, 201, res);
});

// ── @desc    Login user and return JWT token
// ── @route   POST /api/auth/login
// ── @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password.", 400));
  }

  // Find user — include password field (excluded by default in schema)
  const user = await User.findOne({ email })
    .select("+password")
    .populate(
      "employee",
      "firstName lastName employeeCode photo department status",
    );

  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  // Check if account is active
  if (!user.isActive) {
    return next(
      new ErrorHandler("Your account is deactivated. Please contact HR.", 403),
    );
  }

  // Check if linked employee is still active
  if (user.employee && user.employee.status === "Terminated") {
    return next(
      new ErrorHandler("Your employment has been terminated. Contact HR.", 403),
    );
  }

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// ── @desc    Get currently logged-in user profile
// ── @route   GET /api/auth/me
// ── @access  Private (any logged-in user)
exports.getMe = asyncHandler(async (req, res, next) => {
  // req.user is already attached by protect middleware
  const user = await User.findById(req.user._id).populate({
    path: "employee",
    populate: [
      { path: "department", select: "name code" },
      { path: "position", select: "title grade" },
    ],
  });

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// ── @desc    Change password for logged-in user
// ── @route   PUT /api/auth/change-password
// ── @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new ErrorHandler("Please provide current and new password.", 400),
    );
  }

  if (newPassword.length < 6) {
    return next(
      new ErrorHandler("New password must be at least 6 characters.", 400),
    );
  }

  // Fetch user with password field included
  const user = await User.findById(req.user._id).select("+password");

  // Verify current password is correct
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorHandler("Current password is incorrect.", 400));
  }

  // Update password — pre-save hook will hash it
  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully.",
  });
});

// ── @desc    Get all system users (for admin management)
// ── @route   GET /api/auth/users
// ── @access  Super Admin, HR Manager
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find()
    .populate("employee", "firstName lastName employeeCode department")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

// ── @desc    Activate or deactivate a user account
// ── @route   PUT /api/auth/users/:id/toggle
// ── @access  Super Admin
exports.toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  // Prevent deactivating your own account
  if (user._id.toString() === req.user._id.toString()) {
    return next(
      new ErrorHandler("You cannot deactivate your own account.", 400),
    );
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User account ${user.isActive ? "activated" : "deactivated"} successfully.`,
    isActive: user.isActive,
  });
});
