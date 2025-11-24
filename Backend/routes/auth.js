// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

// Register new user
router.post(
  "/register",
  [
    check(
      "name",
      "Name is required and must be at least 3 characters"
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

      const { name, email, password } = req.body;
      console.log(`🔧 Register attempt for: ${email}`);

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      }

      // Create new user (default role is 'user')
      const user = new User({
        name,
        email,
        password, // Will be hashed by the pre-save middleware
        role: "user", // Default role
      });

      await user.save();
      console.log(`✅ User registered successfully: ${email}`);

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || "fallback_secret_key",
        { expiresIn: "7d" }
      );

      // Return user data without password
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        divisions: user.divisions,
        organisationalUnits: user.organisationalUnits,
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

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt for: ${email}`);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user and populate divisions/OU
    const user = await User.findOne({ email })
      .populate("divisions", "name description")
      .populate("organisationalUnits", "name description");

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.log(`🔑 User found: ${user.email}, checking password...`);

    // Use the corrected password comparison
    const isPasswordValid = await user.correctPassword(password);

    if (!isPasswordValid) {
      console.log(`❌ Invalid password for: ${email}`);
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.log(`✅ Login successful for: ${user.email}`);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "7d" }
    );

    // Return user data without password
    const userResponse = {
      _id: user._id,
      name: user.name,
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
    // This would typically use auth middleware
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
