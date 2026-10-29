// utils/seedLeaveTypes.js
// Run this once to create the default leave types for Injibara University.
// Command: node utils/seedLeaveTypes.js

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { LeaveType } = require("../models/Leave");

const defaultLeaveTypes = [
  {
    name: "Annual Leave",
    code: "AL",
    defaultDays: 20,
    isPaid: true,
    requiresProof: false,
    carryForward: true,
    maxCarryDays: 5,
    gender: null,
  },
  {
    name: "Sick Leave",
    code: "SL",
    defaultDays: 15,
    isPaid: true,
    requiresProof: true, // requires medical certificate
    carryForward: false,
    gender: null,
  },
  {
    name: "Maternity Leave",
    code: "ML",
    defaultDays: 90,
    isPaid: true,
    requiresProof: false,
    carryForward: false,
    gender: "Female",
  },
  {
    name: "Paternity Leave",
    code: "PL",
    defaultDays: 5,
    isPaid: true,
    requiresProof: false,
    carryForward: false,
    gender: "Male",
  },
  {
    name: "Sabbatical Leave",
    code: "SAB",
    defaultDays: 180,
    isPaid: true,
    requiresProof: false,
    carryForward: false,
    gender: null,
  },
  {
    name: "Unpaid Leave",
    code: "UL",
    defaultDays: 30,
    isPaid: false,
    requiresProof: false,
    carryForward: false,
    gender: null,
  },
  {
    name: "Emergency Leave",
    code: "EL",
    defaultDays: 3,
    isPaid: true,
    requiresProof: false,
    carryForward: false,
    gender: null,
  },
];

const seedLeaveTypes = async () => {
  try {
    await connectDB();

    // Remove existing leave types
    await LeaveType.deleteMany();

    // Insert default types
    const inserted = await LeaveType.insertMany(defaultLeaveTypes);
    console.log(`✅ ${inserted.length} leave types created successfully.`);

    inserted.forEach((t) =>
      console.log(`   - ${t.name} (${t.code}): ${t.defaultDays} days`),
    );

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedLeaveTypes();
