const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const OrganizationalUnit = require("./models/OrganizationalUnit");
const Division = require("./models/Division");
require("dotenv").config();

const cleanSeedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Drop the entire database to remove all indexes
    await mongoose.connection.dropDatabase();
    console.log("🗑️ Dropped entire database to clear old indexes");

    // Now run the seeding
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
    console.log(
      `✅ ${organizationalUnits.length} organizational units loaded successfully`
    );

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
    console.log(`✅ ${divisions.length} divisions loaded successfully`);

    // Create users with hashed passwords
    const hashedPassword123 = await bcrypt.hash("password123", 12);
    const hashedSupremeLeader = await bcrypt.hash("SupremeLeader123", 12);

    const users = await User.insertMany([
      {
        email: "normal.user@cooltech.com",
        password: hashedPassword123,
        role: "user",
        organizationalUnits: [organizationalUnits[0]._id],
        divisions: [divisions[0]._id, divisions[1]._id],
      },
      {
        email: "manager.user@cooltech.com",
        password: hashedPassword123,
        role: "manager",
        organizationalUnits: [
          organizationalUnits[1]._id,
          organizationalUnits[2]._id,
        ],
        divisions: [divisions[4]._id, divisions[7]._id],
      },
      {
        email: "admin.user@cooltech.com",
        password: hashedPassword123,
        role: "admin",
        organizationalUnits: organizationalUnits.map((ou) => ou._id),
        divisions: divisions.map((div) => div._id),
      },
      {
        email: "alex@cooltech.io",
        password: hashedSupremeLeader,
        role: "admin",
        organizationalUnits: organizationalUnits.map((ou) => ou._id),
        divisions: divisions.map((div) => div._id),
      },
      {
        email: "test.user@cooltech.com",
        password: hashedPassword123,
        role: "user",
        organizationalUnits: [organizationalUnits[3]._id],
        divisions: [divisions[11]._id],
      },
    ]);
    console.log(`✅ ${users.length} users loaded successfully`);

    console.log("\n🎉 === Database Seeding Completed ===");
    console.log("📊 Summary:");
    console.log(
      `- ${organizationalUnits.length} organizational units loaded successfully`
    );
    console.log(`- ${divisions.length} divisions loaded successfully`);
    console.log(`- ${users.length} users loaded successfully`);

    console.log("\n🔐 Login Credentials:");
    console.log("👤 Normal User: normal.user@cooltech.com / password123");
    console.log("👨‍💼 Manager User: manager.user@cooltech.com / password123");
    console.log("👑 Admin User: admin.user@cooltech.com / password123");
    console.log("👑 Alex Admin: alex@cooltech.io / SupremeLeader123");
    console.log("🧪 Test User: test.user@cooltech.com / password123");
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

cleanSeedDatabase();
