const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // Assuming you created this earlier
const employeeRoutes = require("./routes/employeeRoutes");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use("/api/employees", employeeRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
