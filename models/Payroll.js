// models/Payroll.js
// Salary structure, monthly payroll processing, and payslip generation.

const mongoose = require("mongoose");

// ── Salary Structure (allowances + deductions per grade) ──────────────────────
const salaryStructureSchema = new mongoose.Schema(
  {
    grade: { type: String, required: true, unique: true, trim: true },
    // e.g., "Grade A", "Lecturer Step 1"
    basicSalary: { type: Number, required: true },
    allowances: [
      {
        name: { type: String }, // e.g., "Housing", "Transport"
        amount: { type: Number },
        type: { type: String, enum: ["Fixed", "Percentage"], default: "Fixed" },
      },
    ],
    deductions: [
      {
        name: { type: String }, // e.g., "Income Tax", "Pension"
        amount: { type: Number },
        type: {
          type: String,
          enum: ["Fixed", "Percentage"],
          default: "Percentage",
        },
      },
    ],
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true },
);

// ── Monthly Payroll Record ────────────────────────────────────────────────────
const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: { type: Number, required: true }, // 1–12
    year: { type: Number, required: true },
    payPeriod: { type: String }, // e.g., "March 2024"

    // ── Earnings ─────────────────────────────────────────────────────────────
    basicSalary: { type: Number, default: 0 },
    allowances: [{ name: String, amount: Number }],
    overtimePay: { type: Number, default: 0 },
    bonuses: { type: Number, default: 0 },
    grossSalary: { type: Number, default: 0 }, // calculated total

    // ── Deductions ────────────────────────────────────────────────────────────
    incomeTax: { type: Number, default: 0 }, // Ethiopian tax brackets
    pensionEmployee: { type: Number, default: 0 }, // 7% employee contribution
    pensionEmployer: { type: Number, default: 0 }, // 11% employer contribution
    otherDeductions: [{ name: String, amount: Number }],
    totalDeductions: { type: Number, default: 0 },

    // ── Net Pay ───────────────────────────────────────────────────────────────
    netSalary: { type: Number, default: 0 }, // grossSalary - totalDeductions

    // ── Adjustments ───────────────────────────────────────────────────────────
    unpaidLeaveDays: { type: Number, default: 0 },
    unpaidLeaveAmount: { type: Number, default: 0 },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["Draft", "Approved", "Paid"],
      default: "Draft",
    },
    paymentDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "Cheque", "Cash"],
      default: "Bank Transfer",
    },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// ── One payroll record per employee per month/year ────────────────────────────
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = {
  SalaryStructure: mongoose.model("SalaryStructure", salaryStructureSchema),
  Payroll: mongoose.model("Payroll", payrollSchema),
};
