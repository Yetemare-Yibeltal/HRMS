// server.js
// Main entry point for the Injibara University HRMS backend.
// Sets up Express, middleware, database connection, and all routes.

require("dotenv").config(); // Load environment variables first
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");

const app = express();

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet()); // Sets secure HTTP response headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Allow cookies/auth headers
  }),
);
app.use(morgan("dev")); // Log each HTTP request in development
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

// ─── Static Files (uploaded documents, profile photos) ───────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Health Check Route ───────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Injibara University HRMS API v1.0",
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes (will be added as we build each module) ──────────────────────
// app.use('/api/auth',      require('./routes/auth'))
// app.use('/api/employees', require('./routes/employees'))
// ... more routes added per module

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`❌ Error: ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Show stack trace only in development
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
