// models/Disciplinary.js
// Incident reports, disciplinary cases, hearings, and grievances.

const mongoose = require("mongoose");

const disciplinarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      enum: ["Warning", "Suspension", "Demotion", "Termination", "Grievance"],
      required: true,
    },
    incidentDate: { type: Date, required: true },
    description: { type: String, required: true, trim: true },
    evidenceFiles: { type: [String], default: [] }, // uploaded file paths

    // ── Hearing ───────────────────────────────────────────────────────────────
    hearingDate: { type: Date },
    hearingNotes: { type: String },
    outcome: { type: String, trim: true }, // result of hearing

    // ── Warning Letter ────────────────────────────────────────────────────────
    warningLevel: {
      type: String,
      enum: ["Verbal", "Written 1st", "Written 2nd", "Final", ""],
      default: "",
    },
    letterFileUrl: { type: String },

    status: {
      type: String,
      enum: ["Open", "Under Review", "Resolved", "Closed"],
      default: "Open",
    },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Disciplinary", disciplinarySchema);
