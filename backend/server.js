// server.js
// Main entry point for the Injibara University HRMS backend.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");

const app = express();

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Security & Utility Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Injibara University HRMS API v1.0",
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',           require('./routes/authRoutes'))
app.use('/api/departments',    require('./routes/departmentRoutes'))
app.use('/api/positions',      require('./routes/positionRoutes'))
app.use('/api/employees',      require('./routes/employeeRoutes'))
app.use('/api/leaves',         require('./routes/leaveRoutes'))
app.use('/api/attendance',     require('./routes/attendanceRoutes'))
app.use('/api/payroll',        require('./routes/payrollRoutes'))
app.use('/api/recruitment',    require('./routes/recruitmentRoutes'))
app.use('/api/appraisals',     require('./routes/appraisalRoutes'))
app.use('/api/training',       require('./routes/trainingRoutes'))
app.use('/api/disciplinary',   require('./routes/disciplinaryRoutes'))
app.use('/api/exit',           require('./routes/exitRoutes'))
app.use('/api/notifications',  require('./routes/notificationRoutes'))
app.use('/api/auth',         require('./routes/authRoutes'))
app.use('/api/departments',  require('./routes/departmentRoutes'))
app.use('/api/positions',    require('./routes/positionRoutes'))
app.use('/api/employees',    require('./routes/employeeRoutes'))
app.use('/api/leaves',       require('./routes/leaveRoutes'))
app.use('/api/attendance',   require('./routes/attendanceRoutes'))
app.use('/api/payroll',      require('./routes/payrollRoutes'))
app.use('/api/recruitment',  require('./routes/recruitmentRoutes'))
app.use('/api/appraisals',   require('./routes/appraisalRoutes'))
app.use('/api/auth',         require('./routes/authRoutes'))
app.use('/api/departments',  require('./routes/departmentRoutes'))
app.use('/api/positions',    require('./routes/positionRoutes'))
app.use('/api/employees',    require('./routes/employeeRoutes'))
app.use('/api/leaves',       require('./routes/leaveRoutes'))
app.use('/api/attendance',   require('./routes/attendanceRoutes'))
app.use('/api/payroll',      require('./routes/payrollRoutes'))
app.use('/api/recruitment',  require('./routes/recruitmentRoutes'))
app.use('/api/auth',        require('./routes/authRoutes'))
app.use('/api/departments', require('./routes/departmentRoutes'))
app.use('/api/positions',   require('./routes/positionRoutes'))
app.use('/api/employees',   require('./routes/employeeRoutes'))
app.use('/api/leaves',      require('./routes/leaveRoutes'))
app.use('/api/attendance',  require('./routes/attendanceRoutes'))
app.use('/api/payroll',     require('./routes/payrollRoutes'))
app.use('/api/auth',        require('./routes/authRoutes'))
app.use('/api/departments', require('./routes/departmentRoutes'))
app.use('/api/positions',   require('./routes/positionRoutes'))
app.use('/api/employees',   require('./routes/employeeRoutes'))
app.use('/api/leaves',      require('./routes/leaveRoutes'))
app.use('/api/attendance',  require('./routes/attendanceRoutes'))
app.use('/api/auth',        require('./routes/authRoutes'))
app.use('/api/departments', require('./routes/departmentRoutes'))
app.use('/api/positions',   require('./routes/positionRoutes'))
app.use('/api/employees',   require('./routes/employeeRoutes'))
app.use('/api/leaves',      require('./routes/leaveRoutes'))
app.use('/api/auth',        require('./routes/authRoutes'))
app.use('/api/departments', require('./routes/departmentRoutes'))
app.use('/api/positions',   require('./routes/positionRoutes'))
app.use('/api/employees',   require('./routes/employeeRoutes'))
app.use("/api/auth", require("./routes/authRoutes"));

// ─── Global Error Handler ─────────────────────────────────────────────────────
// IMPORTANT: must be defined AFTER all routes
app.use((err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error = { message: "Resource not found.", statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = { message: `${field} already exists.`, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = { message: "Invalid token.", statusCode: 401 };
  }
  if (err.name === "TokenExpiredError") {
    error = { message: "Token expired. Please log in again.", statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});
