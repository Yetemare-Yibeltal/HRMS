// models/Employee.js
// Central employee profile — the most important model in the system.
// Every other module (leave, payroll, attendance) references this.

const mongoose = require("mongoose");

// ── Sub-schema: Emergency Contact ─────────────────────────────────────────────
const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true }, // e.g., "Spouse", "Parent"
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { _id: false },
); // no separate _id for sub-documents

// ── Sub-schema: Education / Academic Qualification ────────────────────────────
const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true }, // e.g., "MSc", "PhD"
    field: { type: String, trim: true }, // e.g., "Computer Science"
    institution: { type: String, trim: true },
    year: { type: Number },
  },
  { _id: false },
);

// ── Sub-schema: Employment History ────────────────────────────────────────────
const historySchema = new mongoose.Schema(
  {
    event: { type: String, trim: true }, // e.g., "Promoted", "Transferred"
    from: { type: String, trim: true }, // previous position/department
    to: { type: String, trim: true }, // new position/department
    date: { type: Date },
    remarks: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: true },
);

// ── Main Employee Schema ───────────────────────────────────────────────────────
const employeeSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    employeeCode: {
      type: String,
      required: [true, "Employee code is required"],
      unique: true,
      trim: true,
      // e.g., "INJ-0001" — generated automatically later
    },
    title: {
      type: String,
      enum: ["Mr", "Mrs", "Ms", "Dr", "Prof", "Ato", "W/ro", "W/t"],
      // Ethiopian titles included
    },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true }, // Ethiopian naming convention
    lastName: { type: String, required: true, trim: true },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    dateOfBirth: { type: Date },
    nationality: { type: String, default: "Ethiopian", trim: true },
    nationalId: { type: String, trim: true }, // Ethiopian national ID
    tinNumber: { type: String, trim: true }, // Tax Identification Number

    // ── Contact Information ───────────────────────────────────────────────────
    personalEmail: { type: String, trim: true, lowercase: true },
    workEmail: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    address: {
      region: { type: String, trim: true }, // e.g., "Amhara"
      zone: { type: String, trim: true }, // e.g., "Awi"
      woreda: { type: String, trim: true }, // e.g., "Injibara"
      kebele: { type: String, trim: true },
      houseNo: { type: String, trim: true },
    },

    // ── Employment Details ────────────────────────────────────────────────────
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
    },
    employmentType: {
      type: String,
      enum: ["Permanent", "Contract", "Part-Time", "Visiting", "Intern"],
      required: true,
    },
    dateOfJoining: { type: Date, required: true },
    contractEndDate: { type: Date }, // for contract employees
    probationEndDate: { type: Date },
    salaryGrade: { type: String, trim: true },
    basicSalary: { type: Number, default: 0 },

    // ── Academic Details (for faculty) ────────────────────────────────────────
    academicRank: {
      type: String,
      enum: [
        "Graduate Assistant",
        "Assistant Lecturer",
        "Lecturer",
        "Assistant Professor",
        "Associate Professor",
        "Professor",
        "",
      ],
      default: "",
    },
    specialization: { type: String, trim: true }, // e.g., "Machine Learning"

    // ── Bank Details (for payroll) ────────────────────────────────────────────
    bankName: { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },
    bankBranch: { type: String, trim: true },

    // ── Profile Photo ─────────────────────────────────────────────────────────
    photo: {
      type: String,
      default: "",
      // stores file path e.g., "/uploads/photos/INJ-0001.jpg"
    },

    // ── Sub-documents ─────────────────────────────────────────────────────────
    emergencyContact: { type: emergencyContactSchema, default: {} },
    education: { type: [educationSchema], default: [] },
    employmentHistory: { type: [historySchema], default: [] },

    // ── Documents ─────────────────────────────────────────────────────────────
    documents: [
      {
        name: { type: String }, // e.g., "Degree Certificate"
        fileUrl: { type: String }, // path in uploads folder
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["Active", "Inactive", "On-Leave", "Suspended", "Terminated"],
      default: "Active",
    },

    // ── System Link ───────────────────────────────────────────────────────────
    userId: {
      // Links to the User account for this employee (for login)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ── Virtual: Full Name ────────────────────────────────────────────────────────
// Computed field — not stored in DB, but accessible as employee.fullName
employeeSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.middleName || ""} ${this.lastName}`.trim();
});

// Include virtuals when converting to JSON (for API responses)
employeeSchema.set("toJSON", { virtuals: true });
employeeSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Employee", employeeSchema);
