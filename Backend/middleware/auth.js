const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    console.log("🔐 Auth middleware - Verifying token...");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );
    console.log("🔐 Auth middleware - Decoded token:", decoded);

    // Extract user ID from the simplified token payload
    // The token structure is now: { id: 'user_id' }
    const userId = decoded.id;

    if (!userId) {
      console.log("🔐 Auth middleware - No user ID found in token");
      return res
        .status(401)
        .json({ message: "Token is not valid - no user ID" });
    }

    console.log("🔐 Auth middleware - Found user ID:", userId);

    const user = await User.findById(userId).populate(
      "organizationalUnits divisions"
    );

    if (!user) {
      console.log("🔐 Auth middleware - User not found in database");
      return res
        .status(401)
        .json({ message: "Token is not valid - user not found" });
    }

    console.log("🔐 Auth middleware - User authenticated:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error("🔐 Auth middleware error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    res.status(401).json({ message: "Token is not valid" });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

module.exports = { auth, requireRole };
