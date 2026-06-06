// models/Training.js
// Training programs, nominations, attendance, and certification tracking.

const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: [
        "Workshop",
        "Seminar",
        "Online Course",
        "Conference",
        "On-the-Job",
      ],
      default: "Workshop",
    },
    provider: { type: String, trim: true }, // external or internal
    venue: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: Number }, // hours
    maxParticipants: { type: Number, default: 30 },
    cost: { type: Number, default: 0 }, // training cost in ETB

    // ── Participants ──────────────────────────────────────────────────────────
    participants: [
      {
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        status: {
          type: String,
          enum: ["Nominated", "Approved", "Attended", "Absent", "Completed"],
          default: "Nominated",
        },
        score: { type: Number }, // post-training evaluation score
        certificateUrl: { type: String }, // path to certificate file
        completedAt: { type: Date },
      },
    ],

    status: {
      type: String,
      enum: ["Planned", "Ongoing", "Completed", "Cancelled"],
      default: "Planned",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Training", trainingSchema);
