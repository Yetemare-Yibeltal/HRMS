// utils/seedSalaryStructures.js
// Creates default salary structures for Injibara University
// Run once: node utils/seedSalaryStructures.js

require("dotenv").config();
const connectDB = require("../config/db");
const { SalaryStructure } = require("../models/Payroll");

const structures = [
  {
    grade: "Graduate Assistant",
    basicSalary: 5000,
    allowances: [
      { name: "Housing Allowance", amount: 1000, type: "Fixed" },
      { name: "Transport Allowance", amount: 500, type: "Fixed" },
    ],
    deductions: [],
  },
  {
    grade: "Assistant Lecturer",
    basicSalary: 7000,
    allowances: [
      { name: "Housing Allowance", amount: 1500, type: "Fixed" },
      { name: "Transport Allowance", amount: 700, type: "Fixed" },
    ],
    deductions: [],
  },
  {
    grade: "Lecturer",
    basicSalary: 10000,
    allowances: [
      { name: "Housing Allowance", amount: 2000, type: "Fixed" },
      { name: "Transport Allowance", amount: 1000, type: "Fixed" },
      { name: "Research Allowance", amount: 500, type: "Fixed" },
    ],
    deductions: [],
  },
  {
    grade: "Assistant Professor",
    basicSalary: 14000,
    allowances: [
      { name: "Housing Allowance", amount: 3000, type: "Fixed" },
      { name: "Transport Allowance", amount: 1200, type: "Fixed" },
      { name: "Research Allowance", amount: 1000, type: "Fixed" },
    ],
    deductions: [],
  },
  {
    grade: "Associate Professor",
    basicSalary: 18000,
    allowances: [
      { name: "Housing Allowance", amount: 4000, type: "Fixed" },
      { name: "Transport Allowance", amount: 1500, type: "Fixed" },
      { name: "Research Allowance", amount: 1500, type: "Fixed" },
    ],
    deductions: [],
  },
  {
    grade: "Professor",
    basicSalary: 25000,
    allowances: [
      { name: "Housing Allowance", amount: 6000, type: "Fixed" },
      { name: "Transport Allowance", amount: 2000, type: "Fixed" },
      { name: "Research Allowance", amount: 2500, type: "Fixed" },
    ],
    deductions: [],
  },
  {
    grade: "HR Officer",
    basicSalary: 8000,
    allowances: [
      { name: "Housing Allowance", amount: 1500, type: "Fixed" },
      { name: "Transport Allowance", amount: 800, type: "Fixed" },
    ],
    deductions: [],
  },
];

const seed = async () => {
  try {
    await connectDB();
    await SalaryStructure.deleteMany();
    const inserted = await SalaryStructure.insertMany(structures);
    console.log(`✅ ${inserted.length} salary structures created.`);
    inserted.forEach((s) =>
      console.log(
        `   - ${s.grade}: ETB ${s.basicSalary.toLocaleString()} basic`,
      ),
    );
    process.exit(0);
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    process.exit(1);
  }
};

seed();
