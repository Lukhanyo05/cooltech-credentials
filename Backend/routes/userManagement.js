const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Division = require("../models/Division");
const OrganizationalUnit = require("../models/OrganizationalUnit");
const { auth } = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

// Get all users (Admin only) - REMOVE DUPLICATE
router.get("/users", auth, async (req, res) => {
  try {
    console.log("GET /users - User making request:", req.user.email);

    // Check if user is admin
    if (req.user.role !== "admin") {
      console.log("Access denied - user role:", req.user.role);
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    console.log("User is admin, fetching users...");
    const users = await User.find()
      .select("-password")
      .populate("divisions", "name description")
      .populate("organizationalUnits", "name description");

    console.log("Users fetched successfully, count:", users.length);
    res.json(users);
  } catch (error) {
    console.error("Error in GET /users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change user role (Admin only)
router.put(
  "/users/:userId/role",
  [auth, check("role", "Role is required").isIn(["user", "manager", "admin"])],
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Admin role required." });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { role } = req.body;
      const userId = req.params.userId;

      // Prevent self-role change
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Cannot change your own role" });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User role updated successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Assign user to division (Admin only)
router.post("/users/:userId/divisions/:divisionId", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    const { userId, divisionId } = req.params;

    const user = await User.findById(userId);
    const division = await Division.findById(divisionId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    // Check if user is already assigned to this division
    if (user.divisions.includes(divisionId)) {
      return res
        .status(400)
        .json({ message: "User already assigned to this division" });
    }

    // Add division to user and user to division
    user.divisions.push(divisionId);
    division.users.push(userId);

    await user.save();
    await division.save();

    const updatedUser = await User.findById(userId)
      .select("-password")
      .populate("divisions", "name description")
      .populate("organizationalUnits", "name description");

    res.json({
      message: "User assigned to division successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unassign user from division (Admin only)
router.delete(
  "/users/:userId/divisions/:divisionId",
  auth,
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Admin role required." });
      }

      const { userId, divisionId } = req.params;

      const user = await User.findById(userId);
      const division = await Division.findById(divisionId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!division) {
        return res.status(404).json({ message: "Division not found" });
      }

      // Remove division from user and user from division
      user.divisions = user.divisions.filter(
        (div) => div.toString() !== divisionId
      );
      division.users = division.users.filter(
        (user) => user.toString() !== userId
      );

      await user.save();
      await division.save();

      const updatedUser = await User.findById(userId)
        .select("-password")
        .populate("divisions", "name description")
        .populate("organizationalUnits", "name description");

      res.json({
        message: "User unassigned from division successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Assign user to organizational unit (Admin only)
router.post("/users/:userId/ous/:ouId", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    const { userId, ouId } = req.params;

    const user = await User.findById(userId);
    const ou = await OrganizationalUnit.findById(ouId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!ou) {
      return res.status(404).json({ message: "Organizational unit not found" });
    }

    // Check if user is already assigned to this OU
    if (user.organizationalUnits.includes(ouId)) {
      return res
        .status(400)
        .json({ message: "User already assigned to this organizational unit" });
    }

    // Add OU to user and user to OU
    user.organizationalUnits.push(ouId);
    ou.users.push(userId);

    await user.save();
    await ou.save();

    const updatedUser = await User.findById(userId)
      .select("-password")
      .populate("divisions", "name description")
      .populate("organizationalUnits", "name description");

    res.json({
      message: "User assigned to organizational unit successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unassign user from organizational unit (Admin only)
router.delete("/users/:userId/ous/:ouId", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    const { userId, ouId } = req.params;

    const user = await User.findById(userId);
    const ou = await OrganizationalUnit.findById(ouId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!ou) {
      return res.status(404).json({ message: "Organizational unit not found" });
    }

    // Remove OU from user and user from OU
    user.organizationalUnits = user.organizationalUnits.filter(
      (unit) => unit.toString() !== ouId
    );
    ou.users = ou.users.filter((user) => user.toString() !== userId);

    await user.save();
    await ou.save();

    const updatedUser = await User.findById(userId)
      .select("-password")
      .populate("divisions", "name description")
      .populate("organizationalUnits", "name description");

    res.json({
      message: "User unassigned from organizational unit successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all divisions for admin panel - FIXED: Remove populate for now
router.get("/divisions", auth, async (req, res) => {
  try {
    console.log("GET /divisions - User making request:", req.user.email);

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    console.log("Fetching divisions...");
    // REMOVE the problematic populate for now
    const divisions = await Division.find(); // Remove: .populate("users", "name email role")

    console.log("Divisions fetched successfully, count:", divisions.length);
    res.json(divisions);
  } catch (error) {
    console.error("Error in GET /divisions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all organizational units for admin panel - FIXED: Remove populate for now
router.get("/ous", auth, async (req, res) => {
  try {
    console.log("GET /ous - User making request:", req.user.email);

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    console.log("Fetching organizational units...");
    // REMOVE the problematic populate for now
    const ous = await OrganizationalUnit.find(); // Remove: .populate("users", "name email role")

    console.log("OUs fetched successfully, count:", ous.length);
    res.json(ous);
  } catch (error) {
    console.error("Error in GET /ous:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
