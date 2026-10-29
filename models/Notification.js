// models/Notification.js
// System notifications for leave approvals, payslips, contract expiry, etc.

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "Leave",
        "Payroll",
        "Attendance",
        "Appraisal",
        "Recruitment",
        "Training",
        "Disciplinary",
        "General",
      ],
      default: "General",
    },
    link: { type: String }, // frontend route to navigate to on click
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
