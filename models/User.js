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
      select: false,
    },
    role: {
      type: String,
      enum: ["super_admin", "hr_manager", "payroll_officer", "hod", "employee"],
      default: "employee",
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
  },
  { timestamps: true },
);

// ── Hash password before saving ───────────────────────────────────────────────
// NOTE: No 'next' parameter — modern Mongoose handles async pre hooks
// automatically when no next() is called. Just return the promise.
userSchema.pre("save", async function () {
  // Skip if password was not modified
  if (!this.isModified("password")) return;

  // Hash password with 12 salt rounds
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Instance method: compare password ────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
