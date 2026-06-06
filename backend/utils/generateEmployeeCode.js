// utils/generateEmployeeCode.js
// Auto-generates unique employee codes like INJ-0001, INJ-0002, etc.
// Finds the last employee code in the database and increments it.

const Employee = require("../models/Employee");

const generateEmployeeCode = async () => {
  // Find the most recently created employee
  const lastEmployee = await Employee.findOne()
    .sort({ createdAt: -1 }) // get the latest one
    .select("employeeCode");

  if (!lastEmployee || !lastEmployee.employeeCode) {
    // No employees yet — start from INJ-0001
    return "INJ-0001";
  }

  // Extract the number from the code e.g. "INJ-0042" → 42
  const lastCode = lastEmployee.employeeCode;
  const lastNumber = parseInt(lastCode.split("-")[1], 10);

  // Increment and pad to 4 digits e.g. 42 → "0043"
  const nextNumber = (lastNumber + 1).toString().padStart(4, "0");

  return `INJ-${nextNumber}`;
};

module.exports = generateEmployeeCode;
