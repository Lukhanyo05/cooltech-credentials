const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OrganizationalUnit = require("../models/OrganizationalUnit");
const Division = require("../models/Division");
require("dotenv").config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await OrganizationalUnit.deleteMany({});
    await Division.deleteMany({});
    console.log("Cleared existing data");

    // Create Organizational Units
    const organizationalUnits = await OrganizationalUnit.insertMany([
      {
        name: "News Management",
        description: "Handles all news-related content and publications",
      },
      {
        name: "Software Reviews",
        description: "Manages software review content and platforms",
      },
      {
        name: "Hardware Reviews",
        description: "Handles hardware review content and testing",
      },
      {
        name: "Opinion Publishing",
        description: "Manages opinion pieces and editorial content",
      },
    ]);
    console.log("Created Organizational Units");

    // Create Divisions for each OU
    const divisions = await Division.insertMany([
      // News Management Divisions
      {
        name: "Finance",
        organizationalUnit: organizationalUnits[0]._id,
        description: "Financial operations and accounting",
      },
      {
        name: "IT",
        organizationalUnit: organizationalUnits[0]._id,
        description: "IT infrastructure and support",
      },
      {
        name: "Writing",
        organizationalUnit: organizationalUnits[0]._id,
        description: "Content writing and editing",
      },
      {
        name: "Social Media",
        organizationalUnit: organizationalUnits[0]._id,
        description: "Social media management",
      },

      // Software Reviews Divisions
      {
        name: "Development",
        organizationalUnit: organizationalUnits[1]._id,
        description: "Software development and testing",
      },
      {
        name: "QA",
        organizationalUnit: organizationalUnits[1]._id,
        description: "Quality assurance and testing",
      },
      {
        name: "Content",
        organizationalUnit: organizationalUnits[1]._id,
        description: "Content creation and review",
      },

      // Hardware Reviews Divisions
      {
        name: "Testing Lab",
        organizationalUnit: organizationalUnits[2]._id,
        description: "Hardware testing and analysis",
      },
      {
        name: "Review Team",
        organizationalUnit: organizationalUnits[2]._id,
        description: "Hardware review writing",
      },
      {
        name: "Technical",
        organizationalUnit: organizationalUnits[2]._id,
        description: "Technical analysis and benchmarking",
      },

      // Opinion Publishing Divisions
      {
        name: "Editorial",
        organizationalUnit: organizationalUnits[3]._id,
        description: "Editorial team and content review",
      },
      {
        name: "Publishing",
        organizationalUnit: organizationalUnits[3]._id,
        description: "Content publishing and distribution",
      },
      {
        name: "Outreach",
        organizationalUnit: organizationalUnits[3]._id,
        description: "Community outreach and engagement",
      },
    ]);
    console.log("Created Divisions");

    // Create users with hashed passwords
    const hashedPassword123 = await bcrypt.hash("password123", 12);
    const hashedSupremeLeader = await bcrypt.hash("SupremeLeader123", 12);

    const users = await User.insertMany([
      {
        email: "normal.user@cooltech.com",
        password: hashedPassword123,
        role: "user",
        organizationalUnits: [organizationalUnits[0]._id],
        divisions: [divisions[0]._id, divisions[1]._id], // Finance & IT divisions
      },
      {
        email: "manager.user@cooltech.com",
        password: hashedPassword123,
        role: "manager",
        organizationalUnits: [
          organizationalUnits[1]._id,
          organizationalUnits[2]._id,
        ],
        divisions: [divisions[4]._id, divisions[7]._id], // Development & Testing Lab
      },
      {
        email: "admin.user@cooltech.com",
        password: hashedPassword123,
        role: "admin",
        organizationalUnits: organizationalUnits.map((ou) => ou._id), // All OUs
        divisions: divisions.map((div) => div._id), // All divisions
      },
      {
        email: "alex@cooltech.io",
        password: hashedSupremeLeader,
        role: "admin",
        organizationalUnits: organizationalUnits.map((ou) => ou._id), // All OUs
        divisions: divisions.map((div) => div._id), // All divisions
      },
    ]);
    console.log("Created Users");

    console.log("\n=== Database Seeding Completed ===");
    console.log("Created:");
    console.log(`- ${organizationalUnits.length} Organizational Units`);
    console.log(`- ${divisions.length} Divisions`);
    console.log(`- ${users.length} Users`);

    console.log("\nLogin Credentials:");
    console.log("👤 Normal User: normal.user@cooltech.com / password123");
    console.log("👨‍💼 Manager User: manager.user@cooltech.com / password123");
    console.log("👑 Admin User: admin.user@cooltech.com / password123");
    console.log("👑 Alex Admin: alex@cooltech.io / SupremeLeader123");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
};

seedDatabase();
