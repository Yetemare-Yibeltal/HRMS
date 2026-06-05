// models/User.js
// System login accounts — linked to Employee profiles.
// Handles authentication and role-based access control.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never return password in queries by default
    },
    role: {
      type: String,
      enum: [
        "super_admin", // full system access
        "hr_manager", // manage all HR operations
        "payroll_officer", // manage payroll only
        "hod", // Head of Department
        "employee", // self-service access
      ],
      default: "employee",
    },
    employee: {
      // Link to the employee profile (null for super_admin)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

// ── Hash password before saving ───────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  // Only hash if password field was actually modified
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12); // 12 rounds = strong security
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare entered password with hashed ─────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
