// models/Leave.js
// Covers leave types, employee balances, and leave requests with approval workflow.

const mongoose = require("mongoose");

// ── Leave Type (Annual, Sick, Maternity, etc.) ────────────────────────────────
const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // e.g., "Annual Leave", "Sick Leave", "Maternity Leave", "Sabbatical"
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      // e.g., "AL", "SL", "ML"
    },
    defaultDays: { type: Number, required: true }, // days allowed per year
    isPaid: { type: Boolean, default: true },
    requiresProof: { type: Boolean, default: false }, // e.g., sick note
    carryForward: { type: Boolean, default: false }, // unused days carry to next year
    maxCarryDays: { type: Number, default: 0 },
    gender: {
      // null = all genders, 'Female' = maternity, etc.
      type: String,
      enum: ["Male", "Female", null],
      default: null,
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true },
);

// ── Leave Balance (per employee per year) ─────────────────────────────────────
const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true,
    },
    year: { type: Number, required: true }, // e.g., 2024
    allocated: { type: Number, default: 0 }, // total days given
    used: { type: Number, default: 0 }, // days taken
    pending: { type: Number, default: 0 }, // days in pending requests
    remaining: { type: Number, default: 0 }, // allocated - used - pending
  },
  { timestamps: true },
);

// ── Leave Request ─────────────────────────────────────────────────────────────
const leaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true }, // calculated
    reason: { type: String, trim: true },
    attachments: { type: [String], default: [] }, // file paths for proof

    // ── Approval Workflow ─────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["Pending", "Approved by HOD", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
    hodApproval: {
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date },
      remarks: { type: String },
    },
    hrApproval: {
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date },
      remarks: { type: String },
    },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectedReason: { type: String },
  },
  { timestamps: true },
);

module.exports = {
  LeaveType: mongoose.model("LeaveType", leaveTypeSchema),
  LeaveBalance: mongoose.model("LeaveBalance", leaveBalanceSchema),
  LeaveRequest: mongoose.model("LeaveRequest", leaveRequestSchema),
};
