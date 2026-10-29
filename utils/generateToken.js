// utils/generateToken.js
// Generates a signed JWT token for a given user ID.
// Token is sent to the frontend and used in Authorization headers.

const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign(
    { id }, // payload — only store user ID
    process.env.JWT_SECRET, // secret key from .env
    { expiresIn: process.env.JWT_EXPIRE || "30d" }, // token expiry
  );
};

module.exports = generateToken;
