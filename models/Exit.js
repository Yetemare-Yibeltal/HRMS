// models/Exit.js
// Handles resignation, retirement, termination, clearance, and final settlement.

const mongoose = require("mongoose");

const exitSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "Resignation",
        "Retirement",
        "Termination",
        "Contract End",
        "Death",
      ],
      required: true,
    },
    exitDate: { type: Date, required: true },
    noticeDate: { type: Date }, // when they submitted notice
    reason: { type: String, trim: true },

    // ── Clearance Checklist ───────────────────────────────────────────────────
    clearance: {
      library: { cleared: Boolean, clearedBy: String, date: Date },
      it: { cleared: Boolean, clearedBy: String, date: Date },
      finance: { cleared: Boolean, clearedBy: String, date: Date },
      hostel: { cleared: Boolean, clearedBy: String, date: Date },
      hr: { cleared: Boolean, clearedBy: String, date: Date },
    },

    // ── Final Settlement ──────────────────────────────────────────────────────
    settlement: {
      pendingLeaveDays: { type: Number, default: 0 },
      leaveEncashment: { type: Number, default: 0 },
      gratuity: { type: Number, default: 0 },
      otherDues: { type: Number, default: 0 },
      totalSettlement: { type: Number, default: 0 },
      settlementDate: { type: Date },
      settlementStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending",
      },
    },

    // ── Exit Documents ────────────────────────────────────────────────────────
    experienceLetterUrl: { type: String },
    relievingLetterUrl: { type: String },

    // ── Exit Interview ────────────────────────────────────────────────────────
    exitInterview: {
      conductedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date },
      responses: { type: Map, of: String }, // question → answer
      overallRating: { type: Number }, // 1–5
    },

    status: {
      type: String,
      enum: ["Initiated", "In Progress", "Clearance Done", "Completed"],
      default: "Initiated",
    },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Exit", exitSchema);
