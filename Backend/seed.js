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

    // Extract division IDs for easier reference
    const itDivision = divisions[0]._id;
    const financeDivision = divisions[1]._id;
    const hrDivision = divisions[2]._id;
    const marketingDivision = divisions[3]._id;
    const devDivision = divisions[4]._id;
    const contentDivision = divisions[5]._id;

    // Create test users using save() to trigger the pre-save hook
    console.log("👥 Creating users...");

    const user1 = new User({
      username: "normal.user",
      name: "Normal User",
      email: "normal.user@cooltech.com",
      password: "password123",
      role: "user",
      divisions: [itDivision, financeDivision],
      organisationalUnits: [newsOU],
    });

    const user2 = new User({
      username: "manager.user",
      name: "Management User",
      email: "manager.user@cooltech.com",
      password: "password123",
      role: "manager",
      divisions: [hrDivision, marketingDivision],
      organisationalUnits: [softwareOU],
    });

    const user3 = new User({
      username: "admin.user",
      name: "Admin User",
      email: "admin.user@cooltech.com",
      password: "password123",
      role: "admin",
      divisions: [
        itDivision,
        financeDivision,
        hrDivision,
        marketingDivision,
        devDivision,
        contentDivision,
      ],
      organisationalUnits: [newsOU, softwareOU, hardwareOU, opinionOU],
    });

    // Save each user individually to trigger the pre-save hook
    await user1.save();
    await user2.save();
    await user3.save();

    console.log(`✅ Created 3 users`);

    // Update divisions with user references
    console.log("🔄 Updating divisions with user assignments...");

    // IT Division - normal user and admin
    await Division.findByIdAndUpdate(itDivision, {
      $push: { users: { $each: [user1._id, user3._id] } },
    });

    // Finance Division - normal user and admin
    await Division.findByIdAndUpdate(financeDivision, {
      $push: { users: { $each: [user1._id, user3._id] } },
    });

    // HR Division - manager and admin
    await Division.findByIdAndUpdate(hrDivision, {
      $push: { users: { $each: [user2._id, user3._id] } },
    });

    // Marketing Division - manager and admin
    await Division.findByIdAndUpdate(marketingDivision, {
      $push: { users: { $each: [user2._id, user3._id] } },
    });

    // Development Division - admin only
    await Division.findByIdAndUpdate(devDivision, {
      $push: { users: user3._id },
    });

    // Content Division - admin only (for auto-assignment of new users)
    await Division.findByIdAndUpdate(contentDivision, {
      $push: { users: user3._id },
    });

    console.log("✅ Divisions updated with user assignments");

    // Update OUs with user references
    console.log("🔄 Updating OUs with user assignments...");

    // News Management OU - normal user and admin
    await OrganisationalUnit.findByIdAndUpdate(newsOU, {
      $push: { users: { $each: [user1._id, user3._id] } },
    });

    // Software Reviews OU - manager and admin
    await OrganisationalUnit.findByIdAndUpdate(softwareOU, {
      $push: { users: { $each: [user2._id, user3._id] } },
    });

    // Hardware Reviews OU - admin only
    await OrganisationalUnit.findByIdAndUpdate(hardwareOU, {
      $push: { users: user3._id },
    });

    // Opinion Publishing OU - admin only (for auto-assignment of new users)
    await OrganisationalUnit.findByIdAndUpdate(opinionOU, {
      $push: { users: user3._id },
    });

    console.log("✅ OUs updated with user assignments");

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

    // Verify division assignments (without populate to avoid errors)
    console.log("\n🔍 Verifying division assignments...");
    const allDivisions = await Division.find();
    for (let division of allDivisions) {
      const divisionUsers = await User.find({ divisions: division._id }).select(
        "name email role"
      );
      console.log(`   ${division.name}: ${divisionUsers.length} users`);
      divisionUsers.forEach((user) => {
        console.log(`     - ${user.name} (${user.role})`);
      });
    }

    // Verify OU assignments (without populate to avoid errors)
    console.log("\n🔍 Verifying OU assignments...");
    const allOUs = await OrganisationalUnit.find();
    for (let ou of allOUs) {
      const ouUsers = await User.find({ organisationalUnits: ou._id }).select(
        "name email role"
      );
      console.log(`   ${ou.name}: ${ouUsers.length} users`);
      ouUsers.forEach((user) => {
        console.log(`     - ${user.name} (${user.role})`);
      });
    }

    console.log("\n🎉 === SAMPLE DATA CREATED SUCCESSFULLY! ===");

    console.log("\n📋 Test Users (password: password123):");
    console.log("   👤 Normal User: normal.user@cooltech.com (role: user)");
    console.log("     - Username: normal.user");
    console.log("     - Divisions: IT Division, Finance Division");

    console.log(
      "\n   👔 Management User: manager.user@cooltech.com (role: manager)"
    );
    console.log("     - Username: manager.user");
    console.log("     - Divisions: HR Division, Marketing Division");

    console.log("\n   🔧 Admin User: admin.user@cooltech.com (role: admin)");
    console.log("     - Username: admin.user");
    console.log("     - Divisions: ALL divisions");

    console.log("\n🏢 Organisational Units:");
    organisationalUnits.forEach((ou) => {
      console.log(`   • ${ou.name} - ${ou.description}`);
    });

    console.log("\n🏭 Divisions:");
    divisions.forEach((div) => {
      const ouName =
        organisationalUnits.find((ou) => ou._id.equals(div.organisationalUnit))
          ?.name || "Unknown OU";
      console.log(`   • ${div.name} (${ouName}) - ${div.description}`);
    });

    console.log("\n🚀 IMPORTANT FOR AUTO-ASSIGNMENT:");
    console.log("   New users will be automatically assigned to:");
    console.log("   • Division: Content Division");
    console.log("   • OU: Opinion Publishing");

    console.log("\n✅ SEEDING COMPLETED - All relationships established!");
  } catch (error) {
    console.error("\n❌ SEEDING FAILED:", error.message);
    console.error("Error details:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the seed function
seedData();
