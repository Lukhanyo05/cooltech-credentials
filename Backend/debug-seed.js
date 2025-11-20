const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const OrganizationalUnit = require("./models/OrganizationalUnit");
const Division = require("./models/Division");
require("dotenv").config();

const seedDatabase = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    console.log(
      "MONGODB_URI:",
      process.env.MONGODB_URI ? "✓ Defined" : "✗ Undefined"
    );

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Test each model individually
    console.log("\n🧪 Testing OrganizationalUnit model...");
    const organizationalUnits = await OrganizationalUnit.insertMany([
      {
        name: "News Management",
        description: "Handles all news-related content and publications",
      },
    ]);
    console.log("✅ OrganizationalUnit test passed");

    console.log("\n🧪 Testing Division model...");
    const divisions = await Division.insertMany([
      {
        name: "Finance",
        organizationalUnit: organizationalUnits[0]._id,
        description: "Financial operations and accounting",
      },
    ]);
    console.log("✅ Division test passed");

    console.log("\n🧪 Testing User model...");
    const hashedPassword = await bcrypt.hash("password123", 12);
    const users = await User.insertMany([
      {
        email: "test@cooltech.com",
        password: hashedPassword,
        role: "user",
        organizationalUnits: [organizationalUnits[0]._id],
        divisions: [divisions[0]._id],
      },
    ]);
    console.log("✅ User test passed");

    console.log("\n🎉 All models working correctly!");
  } catch (error) {
    console.error("❌ Error details:");
    console.error("Name:", error.name);
    console.error("Message:", error.message);

    if (error.name === "ValidationError") {
      console.error("Validation errors:");
      Object.keys(error.errors).forEach((field) => {
        console.error(`- ${field}: ${error.errors[field].message}`);
      });
    }

    if (error.code) {
      console.error("Error code:", error.code);
    }
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("🔌 Database connection closed");
    }
  }
};

seedDatabase();
