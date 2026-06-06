// utils/seedWorkSchedule.js
// Creates the default Injibara University work schedule
// Run once: node utils/seedWorkSchedule.js

require("dotenv").config();
const connectDB = require("../config/db");
const { WorkSchedule } = require("../models/Attendance");

const seedWorkSchedule = async () => {
  try {
    await connectDB();

    await WorkSchedule.deleteMany();

    const schedules = await WorkSchedule.insertMany([
      {
        name: "Standard University Hours",
        startTime: "08:00",
        endTime: "17:00",
        workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        breakMinutes: 60,
        status: "Active",
      },
      {
        name: "Saturday Half Day",
        startTime: "08:00",
        endTime: "12:00",
        workDays: ["Sat"],
        breakMinutes: 0,
        status: "Active",
      },
    ]);

    console.log(`✅ ${schedules.length} work schedules created.`);
    schedules.forEach((s) =>
      console.log(`   - ${s.name}: ${s.startTime} - ${s.endTime}`),
    );
    process.exit(0);
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    process.exit(1);
  }
};

seedWorkSchedule();
