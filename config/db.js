// config/db.js
// Handles MongoDB connection using Mongoose.
// Called once at server startup — exits process if connection fails.

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connect using URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error and stop the server — no point running without a database
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
