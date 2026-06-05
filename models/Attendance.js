// models/Attendance.js
// Daily attendance records, work schedules, and overtime tracking.

const mongoose = require("mongoose");

// ── Work Schedule ─────────────────────────────────────────────────────────────
const workScheduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // e.g., "Standard 8-5", "Morning Shift"
    startTime: { type: String, required: true }, // e.g., "08:00"
    endTime: { type: String, required: true }, // e.g., "17:00"
    workDays: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    breakMinutes: { type: Number, default: 60 }, // lunch break
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true },
);

// ── Daily Attendance Record ───────────────────────────────────────────────────
const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      // stored as date only, e.g., 2024-03-15
    },
    checkIn: { type: String }, // e.g., "08:05"
    checkOut: { type: String }, // e.g., "17:10"
    workHours: { type: Number, default: 0 }, // calculated total hours worked
    overtimeHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Half-Day", "On-Leave", "Holiday"],
      default: "Absent",
    },
    source: {
      // How was attendance recorded
      type: String,
      enum: ["Biometric", "Manual", "Self-Service"],
      default: "Manual",
    },
    remarks: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// ── Compound index: one record per employee per day ───────────────────────────
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = {
  WorkSchedule: mongoose.model("WorkSchedule", workScheduleSchema),
  Attendance: mongoose.model("Attendance", attendanceSchema),
};
