// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Division = require("../models/Division");
const OU = require("../models/OrganisationalUnit");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

// Register new user - UPDATED WITH AUTO-ASSIGNMENT TO DIVISIONS
router.post(
  "/register",
  [
    check(
      "name",
      "Name is required and must be at least 3 characters"
    ).isLength({ min: 3 }),
    check(
      "username",
      "Username is required and must be at least 3 characters"
    ).isLength({ min: 3 }),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, username, email, password } = req.body;
      console.log(`🔧 Register attempt for: ${email}, username: ${username}`);

      // Check if user already exists by email OR username
      const existingUser = await User.findOne({
        $or: [{ email: email }, { username: username }],
      });

      if (existingUser) {
        return res.status(400).json({
          message: "User already exists with this email or username",
        });
      }

      // AUTO-ASSIGNMENT: Find default division and OU for new users
      const defaultDivision = await Division.findOne({
        name: "Content Division",
      });
      const defaultOU = await OU.findOne({ name: "Opinion Publishing" });

      console.log(
        `🔧 Auto-assignment - Division: ${defaultDivision?.name}, OU: ${defaultOU?.name}`
      );

      // Create new user with default assignments
      const user = new User({
        name,
        username,
        email,
        password,
        role: "user",
        divisions: defaultDivision ? [defaultDivision._id] : [],
        organisationalUnits: defaultOU ? [defaultOU._id] : [],
      });

      await user.save();

      // Update division with new user
      if (defaultDivision) {
        defaultDivision.users.push(user._id);
        await defaultDivision.save();
        console.log(`✅ User assigned to division: ${defaultDivision.name}`);
      }

      // Update OU with new user
      if (defaultOU) {
        defaultOU.users.push(user._id);
        await defaultOU.save();
        console.log(`✅ User assigned to OU: ${defaultOU.name}`);
      }

      console.log(`✅ User registered successfully: ${email}`);

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET || "fallback_secret_key",
        { expiresIn: "7d" }
      );

      // Return populated user data (including divisions and OUs)
      const populatedUser = await User.findById(user._id)
        .select("-password")
        .populate("divisions", "name description")
        .populate("organisationalUnits", "name description");

      const userResponse = {
        _id: populatedUser._id,
        name: populatedUser.name,
        username: populatedUser.username,
        email: populatedUser.email,
        role: populatedUser.role,
        divisions: populatedUser.divisions,
        organisationalUnits: populatedUser.organisationalUnits,
      };

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: userResponse,
      });
    } catch (error) {
      console.error("❌ Registration error:", error);
      res.status(500).json({
        message: "Server error during registration",
        error: error.message,
      });
    }
  }
);

// Login user - UPDATED TO ACCEPT EMAIL OR USERNAME
router.post("/login", async (req, res) => {
  try {
    // ACCEPT BOTH 'login' AND 'email' FOR COMPATIBILITY
    const loginInput = req.body.login || req.body.email;
    const password = req.body.password;

    console.log(`🔑 Login attempt for: ${loginInput}`);
    console.log(`🔑 Request body:`, req.body);

    // Validate input
    if (!loginInput || !password) {
      return res.status(400).json({
        message: "Email/Username and password are required",
      });
    }

    // Determine if login is email or username
    const isEmail = loginInput.includes("@");
    const query = isEmail ? { email: loginInput } : { username: loginInput };

    console.log(`🔑 Login type: ${isEmail ? "Email" : "Username"}`);

    // Find user by email OR username and populate divisions/OU
    const user = await User.findOne(query)
      .populate("divisions", "name description")
      .populate("organisationalUnits", "name description");

    if (!user) {
      console.log(`❌ User not found: ${loginInput}`);
      return res.status(401).json({
        message: "Invalid email/username or password",
      });
    }

    console.log(
      `🔑 User found: ${user.email} (username: ${user.username}), checking password...`
    );

    // Use the corrected password comparison
    const isPasswordValid = await user.correctPassword(password);

    if (!isPasswordValid) {
      console.log(`❌ Invalid password for: ${loginInput}`);
      return res.status(401).json({
        message: "Invalid email/username or password",
      });
    }

    console.log(`✅ Login successful for: ${user.email}`);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "7d" }
    );

    // Return user data without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      divisions: user.divisions,
      organisationalUnits: user.organisationalUnits,
    };

    res.json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret_key"
    );
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("divisions", "name description")
      .populate("organisationalUnits", "name description");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "Auth route is working!" });
});

module.exports = router;
