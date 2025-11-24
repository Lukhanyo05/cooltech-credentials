// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    console.log("🔐 Auth middleware - Verifying token...");

    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("🔐 Auth middleware - No token provided");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret_key"
    );
    console.log("🔐 Auth middleware - Decoded token:", decoded);

    // Check if we have a user ID in the token
    // Try different possible property names
    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      console.log(
        "❌ Auth middleware - No user ID found in token payload:",
        decoded
      );
      return res
        .status(401)
        .json({ message: "Token is not valid - no user ID" });
    }

    console.log(`🔐 Auth middleware - Found user ID: ${userId}`);

    // Find user by ID
    const user = await User.findById(userId)
      .select("-password")
      .populate("divisions", "name description")
      .populate("organisationalUnits", "name description");

    if (!user) {
      console.log(`❌ Auth middleware - User not found for ID: ${userId}`);
      return res.status(401).json({ message: "User not found" });
    }

    console.log(`✅ Auth middleware - User authenticated: ${user.email}`);

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token is not valid" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    res.status(500).json({ message: "Server error in authentication" });
  }
};

module.exports = { auth };
