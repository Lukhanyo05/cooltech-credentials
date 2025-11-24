const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import models
const User = require("./models/User");
const Division = require("./models/Division");
const OrganisationalUnit = require("./models/OrganisationalUnit");

const seedData = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");

    // Connect to database
    await mongoose.connect("mongodb://localhost:27017/cooltech-credentials", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️ Clearing existing data...");
    await User.deleteMany({});
    await Division.deleteMany({});
    await OrganisationalUnit.deleteMany({});
    console.log("✅ Existing data cleared");

    // Create Organisational Units
    console.log("🏢 Creating organizational units...");
    const organisationalUnits = await OrganisationalUnit.create([
      {
        name: "News Management",
        description: "Handles news content and publications",
      },
      {
        name: "Software Reviews",
        description: "Software testing and review division",
      },
      {
        name: "Hardware Reviews",
        description: "Hardware testing and review division",
      },
      {
        name: "Opinion Publishing",
        description: "Opinion pieces and editorial content",
      },
    ]);
    console.log(
      `✅ Created ${organisationalUnits.length} organisational units`
    );

    // Extract the created OU IDs
    const newsOU = organisationalUnits[0]._id;
    const softwareOU = organisationalUnits[1]._id;
    const hardwareOU = organisationalUnits[2]._id;
    const opinionOU = organisationalUnits[3]._id;

    // Create Divisions
    console.log("🏭 Creating divisions...");
    const divisions = await Division.create([
      {
        name: "IT Division",
        description: "Technical infrastructure and systems",
        organisationalUnit: newsOU,
      },
      {
        name: "Finance Division",
        description: "Financial systems and accounts",
        organisationalUnit: newsOU,
      },
      {
        name: "HR Division",
        description: "Human resources systems",
        organisationalUnit: softwareOU,
      },
      {
        name: "Marketing Division",
        description: "Marketing and social media accounts",
        organisationalUnit: softwareOU,
      },
      {
        name: "Development Division",
        description: "Software development teams",
        organisationalUnit: hardwareOU,
      },
      {
        name: "Content Division",
        description: "Content creation and management",
        organisationalUnit: opinionOU,
      },
    ]);
    console.log(`✅ Created ${divisions.length} divisions`);

    // Create test users using save() to trigger the pre-save hook
    console.log("👥 Creating users...");

    const user1 = new User({
      username: "normaluser",
      email: "normal.user@cooltech.com",
      password: "password123", // Plain text - will be hashed by pre-save hook
      role: "user",
      divisions: [divisions[0]._id, divisions[1]._id],
      organisationalUnits: [newsOU],
    });

    const user2 = new User({
      username: "managementuser",
      email: "manager.user@cooltech.com",
      password: "password123", // Plain text - will be hashed by pre-save hook
      role: "management",
      divisions: [divisions[2]._id, divisions[3]._id],
      organisationalUnits: [softwareOU],
    });

    const user3 = new User({
      username: "adminuser",
      email: "admin.user@cooltech.com",
      password: "password123", // Plain text - will be hashed by pre-save hook
      role: "admin",
      divisions: divisions.map((div) => div._id),
      organisationalUnits: organisationalUnits.map((ou) => ou._id),
    });

    // Save each user individually to trigger the pre-save hook
    await user1.save();
    await user2.save();
    await user3.save();

    console.log(`✅ Created 3 users`);

    // Verify the passwords were stored correctly
    console.log("\n🔐 Verifying password hashing...");
    const testUsers = await User.find({});
    for (let user of testUsers) {
      const isPasswordCorrect = await bcrypt.compare(
        "password123",
        user.password
      );
      console.log(
        `   ${user.email}: Password verification ${
          isPasswordCorrect ? "✅ SUCCESS" : "❌ FAILED"
        }`
      );
      console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
    }

    console.log("\n🎉 === SAMPLE DATA CREATED SUCCESSFULLY! ===");
    console.log("\n📋 Test Users (password: password123):");
    console.log("   👤 Normal User: normal.user@cooltech.com (role: user)");
    console.log(
      "   👔 Management User: manager.user@cooltech.com (role: management)"
    );
    console.log("   🔧 Admin User: admin.user@cooltech.com (role: admin)");

    console.log("\n🏢 Organisational Units:");
    organisationalUnits.forEach((ou) => {
      console.log(`   • ${ou.name}`);
    });

    console.log("\n🏭 Divisions:");
    divisions.forEach((div) => {
      const ouName =
        organisationalUnits.find((ou) => ou._id.equals(div.organisationalUnit))
          ?.name || "Unknown OU";
      console.log(`   • ${div.name} (${ouName})`);
    });
  } catch (error) {
    console.error("\n❌ SEEDING FAILED:", error.message);
    console.error("Error details:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the seed function
seedData();
