// middleware/authMiddleware.js
// Two middleware functions used to protect routes:
// 1. protect     — verifies JWT token, attaches user to req
// 2. authorize   — checks if user has required role(s)

const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/User");

// ── protect ───────────────────────────────────────────────────────────────────
// Verifies the Bearer token from Authorization header.
// Attaches the authenticated user object to req.user for downstream use.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // No token found — reject request
  if (!token) {
    return next(new ErrorHandler("Not authorized. Please log in.", 401));
  }

  try {
    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password field)
    req.user = await User.findById(decoded.id)
      .select("-password")
      .populate("employee", "firstName lastName employeeCode department");

    if (!req.user) {
      return next(new ErrorHandler("User no longer exists.", 401));
    }

    // Block deactivated accounts
    if (!req.user.isActive) {
      return next(
        new ErrorHandler("Your account has been deactivated. Contact HR.", 403),
      );
    }

    next();
  } catch (error) {
    return next(
      new ErrorHandler("Invalid or expired token. Please log in again.", 401),
    );
  }
});

// ── authorize ─────────────────────────────────────────────────────────────────
// Used after protect. Checks if the logged-in user's role is allowed.
// Usage: authorize('hr_manager', 'super_admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role '${req.user.role}' is not authorized to access this route.`,
          403,
        ),
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
