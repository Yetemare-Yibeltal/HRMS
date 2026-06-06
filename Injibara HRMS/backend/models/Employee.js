const mongoose = require("mongoose");

// Schema definition for University Human Resource data
const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  employeeID: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hireDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Active", "On Leave", "Retired"],
    default: "Active",
  },
});

// Export the model so we can use it in our controllers
module.exports = mongoose.model("Employee", employeeSchema);
