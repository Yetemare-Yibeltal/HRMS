// models/Appraisal.js
// Performance appraisal cycles, KPIs, and final ratings.

const mongoose = require("mongoose");

const appraisalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    appraiser: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    // HOD or HR manager who conducts the appraisal

    period: { type: String, required: true }, // e.g., "2024 Annual", "Probation Q1"
    year: { type: Number, required: true },
    type: {
      type: String,
      enum: ["Annual", "Probation", "Mid-Year"],
      default: "Annual",
    },

    // ── KPIs / Goals ──────────────────────────────────────────────────────────
    goals: [
      {
        title: { type: String },
        description: { type: String },
        target: { type: String },
        weight: { type: Number }, // percentage weight of this goal
        selfScore: { type: Number }, // scored by employee
        managerScore: { type: Number }, // scored by manager
      },
    ],

    // ── Evaluation Sections ───────────────────────────────────────────────────
    selfAppraisal: { type: String }, // employee's written self-review
    managerFeedback: { type: String }, // manager's written feedback

    // ── Scores ────────────────────────────────────────────────────────────────
    selfTotalScore: { type: Number, default: 0 },
    managerTotalScore: { type: Number, default: 0 },
    finalScore: { type: Number, default: 0 }, // weighted average

    rating: {
      type: String,
      enum: [
        "Excellent",
        "Very Good",
        "Good",
        "Needs Improvement",
        "Unsatisfactory",
        "",
      ],
      default: "",
    },

    // ── Workflow ──────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "Not Started",
        "Self Appraisal",
        "Manager Review",
        "HR Review",
        "Completed",
      ],
      default: "Not Started",
    },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appraisal", appraisalSchema);
