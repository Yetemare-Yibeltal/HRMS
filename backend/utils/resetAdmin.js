require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const reset = async () => {
  try {
    await connectDB();

    // We need to directly update the password hash
    // bypassing the model to use the pre-save hook correctly
    const User = require("../models/User");

    // Delete ALL existing users and start fresh
    const deleted = await User.deleteMany({});
    console.log(`✅ Deleted ${deleted.deletedCount} old user(s)`);

    // Create fresh super admin
    await User.create({
      email: "admin@injibara.edu.et",
      password: "Admin@2024",
      role: "super_admin",
    });
    console.log("✅ Super Admin created");
    console.log("   Email:    admin@injibara.edu.et");
    console.log("   Password: Admin@2024");

    // Create HR manager
    await User.create({
      email: "hr@injibara.edu.et",
      password: "Hr@2024",
      role: "hr_manager",
    });
    console.log("✅ HR Manager created");
    console.log("   Email:    hr@injibara.edu.et");
    console.log("   Password: Hr@2024");

    // Create payroll officer
    await User.create({
      email: "payroll@injibara.edu.et",
      password: "Payroll@2024",
      role: "payroll_officer",
    });
    console.log("✅ Payroll Officer created");
    console.log("   Email:    payroll@injibara.edu.et");
    console.log("   Password: Payroll@2024");

    console.log("\n🎉 All users reset successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Login now at: http://localhost:5173/login");
    console.log("Email:    admin@injibara.edu.et");
    console.log("Password: Admin@2024");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (error) {
    console.error("❌ Reset failed:", error.message);
    process.exit(1);
  }
};

reset();
