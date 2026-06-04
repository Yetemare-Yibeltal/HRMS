const Employee = require("../models/Employee");

// Controller function to add a new employee
exports.addEmployee = async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res
      .status(201)
      .json({ message: "Employee added successfully", employee: newEmployee });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
