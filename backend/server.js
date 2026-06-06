// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches all errors passed via next(error) from any route or middleware
app.use((err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId — e.g., invalid MongoDB ID format
  if (err.name === "CastError") {
    error = { message: "Resource not found.", statusCode: 404 };
  }

  // Mongoose duplicate key — e.g., duplicate email
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = { message: `${field} already exists.`, statusCode: 400 };
  }

  // Mongoose validation error — e.g., required fields missing
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
