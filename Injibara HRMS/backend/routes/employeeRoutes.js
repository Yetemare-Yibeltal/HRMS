const express = require("express");
const router = express.Router();
const { addEmployee } = require("../controllers/employeeController");

// Define route for adding an employee
router.post("/add", addEmployee);

module.exports = router;
