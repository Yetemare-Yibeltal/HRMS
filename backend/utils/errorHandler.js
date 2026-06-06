// utils/errorHandler.js
// Custom error class that extends the built-in Error.
// Allows us to throw errors with HTTP status codes anywhere in the app.

class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message); // pass message to parent Error class
    this.statusCode = statusCode;

    // Capture stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
