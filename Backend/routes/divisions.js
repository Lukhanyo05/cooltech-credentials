const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Division = require("../models/Division");
const User = require("../models/User");
const OrganisationalUnit = require("../models/OrganisationalUnit");

// Get divisions for logged-in user
router.get("/my-divisions", auth, async (req, res) => {
  try {
    console.log("Fetching divisions for user:", req.user.id);

    const user = await User.findById(req.user.id)
      .populate({
        path: "divisions",
        populate: {
          path: "organisationalUnit",
          model: "OrganisationalUnit",
        },
      })
      .populate("organisationalUnits");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User divisions:", user.divisions);
    console.log("User OUs:", user.organisationalUnits);

    res.json({
      divisions: user.divisions,
      organisationalUnits: user.organisationalUnits,
    });
  } catch (error) {
    console.error("Error in my-divisions endpoint:", error);
    res.status(500).json({
      message: "Server error while fetching divisions",
      error: error.message,
    });
  }
});

// Get all divisions (admin only)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const divisions = await Division.find().populate("organisationalUnit");
    res.json(divisions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
