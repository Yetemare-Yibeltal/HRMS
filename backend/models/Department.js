// models/Department.js
// Represents academic and administrative departments at Injibara University.
// Every employee belongs to a department.

const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
      // e.g., "Computer Science", "Human Resource Office"
    },
    code: {
      type: String,
      required: [true, "Department code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      // e.g., "CS", "HR", "MGMT"
    },
    description: {
      type: String,
      trim: true,
    },
    headOfDepartment: {
      // Reference to the Employee who leads this department
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    parentDepartment: {
      // For faculty > department hierarchy (e.g., Faculty of Engineering > CS)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    budget: {
      // Annual allocated budget for this department
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);

module.exports = mongoose.model("Department", departmentSchema);
