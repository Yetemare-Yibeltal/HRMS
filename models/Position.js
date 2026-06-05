// models/Position.js
// Represents job titles / positions within departments.
// Used in manpower planning, recruitment, and employee profiles.

const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Position title is required"],
      trim: true,
      // e.g., "Lecturer", "Senior Lecturer", "HR Officer", "Dean"
    },
    department: {
      // Which department this position belongs to
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    grade: {
      // Salary/pay grade for this position
      type: String,
      trim: true,
      // e.g., "Grade A", "Grade B2"
    },
    minSalary: {
      type: Number,
      default: 0,
    },
    maxSalary: {
      type: Number,
      default: 0,
    },
    totalSlots: {
      // How many employees can hold this position
      type: Number,
      default: 1,
    },
    filledSlots: {
      // How many are currently filled (updated automatically)
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    requirements: {
      // List of qualifications needed (for recruitment module)
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Position", positionSchema);
