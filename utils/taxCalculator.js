// utils/taxCalculator.js
// Calculates Ethiopian income tax based on official tax brackets
// and pension contributions as per Ethiopian labor law.
//
// Ethiopian Income Tax Brackets (Employment Income):
// 0       - 600     = 0%
// 601     - 1650    = 10%  - 60
// 1651    - 3200    = 15%  - 142.5
// 3201    - 5250    = 20%  - 302.5
// 5251    - 7800    = 25%  - 565
// 7801    - 10900   = 30%  - 955
// 10901+            = 35%  - 1500

const TAX_BRACKETS = [
  { min: 0, max: 600, rate: 0, deduction: 0 },
  { min: 601, max: 1650, rate: 0.1, deduction: 60 },
  { min: 1651, max: 3200, rate: 0.15, deduction: 142.5 },
  { min: 3201, max: 5250, rate: 0.2, deduction: 302.5 },
  { min: 5251, max: 7800, rate: 0.25, deduction: 565 },
  { min: 7801, max: 10900, rate: 0.3, deduction: 955 },
  { min: 10901, max: Infinity, rate: 0.35, deduction: 1500 },
];

// Ethiopian Pension Rates
const PENSION_EMPLOYEE_RATE = 0.07; // 7% of basic salary
const PENSION_EMPLOYER_RATE = 0.11; // 11% of basic salary

// @desc  Calculate income tax for a given taxable income
// @param {Number} taxableIncome - gross salary after pension deduction
// @returns {Number} - tax amount in ETB
const calculateIncomeTax = (taxableIncome) => {
  if (taxableIncome <= 0) return 0;

  // Find the matching tax bracket
  const bracket = TAX_BRACKETS.find(
    (b) => taxableIncome >= b.min && taxableIncome <= b.max,
  );

  if (!bracket) return 0;

  // Tax formula: (income * rate) - deduction
  const tax = taxableIncome * bracket.rate - bracket.deduction;
  return parseFloat(Math.max(0, tax).toFixed(2));
};

// @desc  Calculate pension contributions
// @param {Number} basicSalary - employee basic salary
// @returns {Object} - employee and employer pension amounts
const calculatePension = (basicSalary) => {
  return {
    employee: parseFloat((basicSalary * PENSION_EMPLOYEE_RATE).toFixed(2)),
    employer: parseFloat((basicSalary * PENSION_EMPLOYER_RATE).toFixed(2)),
  };
};

// @desc  Full payroll calculation for one employee
// @param {Object} params - salary details
// @returns {Object} - complete breakdown of earnings and deductions
const calculatePayroll = ({
  basicSalary = 0,
  allowances = [], // [{ name, amount }]
  overtimeHours = 0,
  bonuses = 0,
  unpaidLeaveDays = 0,
  otherDeductions = [], // [{ name, amount }]
}) => {
  // ── Step 1: Calculate total allowances ──────────────────────────────────────
  const totalAllowances = allowances.reduce(
    (sum, a) => sum + (a.amount || 0),
    0,
  );

  // ── Step 2: Calculate overtime pay ──────────────────────────────────────────
  // Overtime rate = 1.25x hourly rate
  // Daily rate    = basicSalary / 30
  // Hourly rate   = dailyRate / 8
  const hourlyRate = basicSalary / 30 / 8;
  const overtimePay = parseFloat(
    (overtimeHours * hourlyRate * 1.25).toFixed(2),
  );

  // ── Step 3: Calculate unpaid leave deduction ─────────────────────────────────
  const dailyRate = parseFloat((basicSalary / 30).toFixed(2));
  const unpaidLeaveAmount = parseFloat(
    (unpaidLeaveDays * dailyRate).toFixed(2),
  );

  // ── Step 4: Gross salary ─────────────────────────────────────────────────────
  const grossSalary = parseFloat(
    (
      basicSalary +
      totalAllowances +
      overtimePay +
      bonuses -
      unpaidLeaveAmount
    ).toFixed(2),
  );

  // ── Step 5: Pension (calculated on basic salary only) ───────────────────────
  const pension = calculatePension(basicSalary);

  // ── Step 6: Taxable income = gross - employee pension ────────────────────────
  const taxableIncome = parseFloat((grossSalary - pension.employee).toFixed(2));

  // ── Step 7: Income tax ───────────────────────────────────────────────────────
  const incomeTax = calculateIncomeTax(taxableIncome);

  // ── Step 8: Other deductions ─────────────────────────────────────────────────
  const totalOtherDeductions = otherDeductions.reduce(
    (sum, d) => sum + (d.amount || 0),
    0,
  );

  // ── Step 9: Total deductions ─────────────────────────────────────────────────
  const totalDeductions = parseFloat(
    (pension.employee + incomeTax + totalOtherDeductions).toFixed(2),
  );

  // ── Step 10: Net salary ──────────────────────────────────────────────────────
  const netSalary = parseFloat((grossSalary - totalDeductions).toFixed(2));

  return {
    basicSalary,
    totalAllowances,
    overtimePay,
    bonuses,
    unpaidLeaveAmount,
    unpaidLeaveDays,
    grossSalary,
    pensionEmployee: pension.employee,
    pensionEmployer: pension.employer,
    taxableIncome,
    incomeTax,
    otherDeductions,
    totalDeductions,
    netSalary,
  };
};

module.exports = {
  calculatePayroll,
  calculateIncomeTax,
  calculatePension,
};
