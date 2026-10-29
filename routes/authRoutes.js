// routes/authRoutes.js
// All authentication-related routes.
// Public routes: register, login
// Private routes: me, change-password, users (admin only)

const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  changePassword,
  getAllUsers,
  toggleUserStatus,
} = require("../controllers/authController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post("/register", register); // open for initial admin setup
router.post("/login", login);

// ── Private Routes (must be logged in) ───────────────────────────────────────
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

// ── Admin Only Routes ─────────────────────────────────────────────────────────
router.get(
  "/users",
  protect,
  authorize("super_admin", "hr_manager"),
  getAllUsers,
);

router.put(
  "/users/:id/toggle",
  protect,
  authorize("super_admin"),
  toggleUserStatus,
);

module.exports = router;
