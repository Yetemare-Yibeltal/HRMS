// models/Recruitment.js
// Job postings, applicant tracking, interviews, and offer letters.

const mongoose = require("mongoose");

// ── Job Posting ───────────────────────────────────────────────────────────────
const jobPostingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    position: { type: mongoose.Schema.Types.ObjectId, ref: "Position" },
    description: { type: String, trim: true },
    requirements: { type: [String], default: [] },
    vacancies: { type: Number, default: 1 },
    type: {
      type: String,
      enum: ["Internal", "External", "Both"],
      default: "Both",
    },
    postingDate: { type: Date, default: Date.now },
    closingDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Draft", "Published", "Closed", "Cancelled"],
      default: "Draft",
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// ── Applicant ─────────────────────────────────────────────────────────────────
const applicantSchema = new mongoose.Schema(
  {
    jobPosting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    resumeUrl: { type: String }, // uploaded file path
    coverLetter: { type: String },
    status: {
      type: String,
      enum: [
        "Applied",
        "Shortlisted",
        "Interview Scheduled",
        "Offered",
        "Hired",
        "Rejected",
      ],
      default: "Applied",
    },
    // ── Interview ──────────────────────────────────────────────────────────────
    interview: {
      date: { type: Date },
      location: { type: String },
      interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
      score: { type: Number }, // out of 100
      feedback: { type: String },
      result: {
        type: String,
        enum: ["Pass", "Fail", "Pending"],
        default: "Pending",
      },
    },
    // ── Offer Letter ──────────────────────────────────────────────────────────
    offer: {
      salary: { type: Number },
      startDate: { type: Date },
      offerDate: { type: Date },
      offerStatus: { type: String, enum: ["Pending", "Accepted", "Declined"] },
      offerFileUrl: { type: String },
    },
  },
  { timestamps: true },
);

module.exports = {
  JobPosting: mongoose.model("JobPosting", jobPostingSchema),
  Applicant: mongoose.model("Applicant", applicantSchema),
};
