// backend/routes/credentials.js
const express = require("express");
const router = express.Router();
const Credential = require("../models/Credential");
const Division = require("../models/Division");
const { auth } = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

// Get all credentials for user's divisions
router.get("/my-credentials", auth, async (req, res) => {
  try {
    console.log(
      "GET /my-credentials - User:",
      req.user.email,
      "Role:",
      req.user.role
    );

    // Get user's divisions
    const userDivisions = req.user.divisions;

    if (!userDivisions || userDivisions.length === 0) {
      return res.json([]);
    }

    const credentials = await Credential.find({
      division: { $in: userDivisions },
    })
      .populate("division", "name description")
      .populate("createdBy", "name email")
      .populate("lastUpdatedBy", "name email")
      .sort({ createdAt: -1 });

    console.log(`Found ${credentials.length} credentials for user`);

    // If user is admin, include passwords, otherwise mask them
    const credentialsWithPasswordControl = credentials.map((credential) => {
      const credentialObj = credential.toObject();

      if (req.user.role !== "admin") {
        // Non-admin users see masked passwords
        credentialObj.password = "••••••••";
      }
      // Admin users see the actual password

      return credentialObj;
    });

    res.json(credentialsWithPasswordControl);
  } catch (error) {
    console.error("Error fetching credentials:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get credentials for a specific division
router.get("/division/:divisionId", auth, async (req, res) => {
  try {
    const { divisionId } = req.params;

    // Check if user has access to this division
    if (!req.user.divisions.includes(divisionId) && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied to this division" });
    }

    const credentials = await Credential.find({ division: divisionId })
      .populate("division", "name description")
      .populate("createdBy", "name email")
      .populate("lastUpdatedBy", "name email")
      .sort({ createdAt: -1 });

    // If user is admin, include passwords, otherwise mask them
    const credentialsWithPasswordControl = credentials.map((credential) => {
      const credentialObj = credential.toObject();

      if (req.user.role !== "admin") {
        credentialObj.password = "••••••••";
      }

      return credentialObj;
    });

    res.json(credentialsWithPasswordControl);
  } catch (error) {
    console.error("Error fetching division credentials:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new credential
router.post(
  "/",
  [
    auth,
    check("title", "Title is required").notEmpty(),
    check("website", "Website is required").notEmpty(),
    check("username", "Username is required").notEmpty(),
    check("password", "Password is required").notEmpty(),
    check("division", "Division is required").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, website, username, password, description, division } =
        req.body;

      // Check if user has access to this division
      if (!req.user.divisions.includes(division) && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Access denied to this division" });
      }

      // Verify division exists
      const divisionExists = await Division.findById(division);
      if (!divisionExists) {
        return res.status(404).json({ message: "Division not found" });
      }

      const credential = new Credential({
        title,
        website,
        username,
        password,
        description,
        division,
        createdBy: req.user.id,
      });

      await credential.save();

      // Populate the saved credential
      const savedCredential = await Credential.findById(credential._id)
        .populate("division", "name description")
        .populate("createdBy", "name email");

      res.status(201).json({
        message: "Credential created successfully",
        credential: savedCredential,
      });
    } catch (error) {
      console.error("Error creating credential:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update credential
router.put(
  "/:credentialId",
  [
    auth,
    check("title", "Title is required").optional().notEmpty(),
    check("website", "Website is required").optional().notEmpty(),
    check("username", "Username is required").optional().notEmpty(),
    check("password", "Password is required").optional().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { credentialId } = req.params;
      const updates = req.body;

      // Find credential
      const credential = await Credential.findById(credentialId);
      if (!credential) {
        return res.status(404).json({ message: "Credential not found" });
      }

      // Check permissions
      const canUpdate =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        credential.createdBy.toString() === req.user.id;

      if (!canUpdate) {
        return res
          .status(403)
          .json({
            message: "Insufficient permissions to update this credential",
          });
      }

      // Check division access for non-admins
      if (
        req.user.role !== "admin" &&
        !req.user.divisions.includes(credential.division.toString())
      ) {
        return res
          .status(403)
          .json({ message: "Access denied to this division" });
      }

      // Update credential
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          credential[key] = updates[key];
        }
      });

      credential.lastUpdatedBy = req.user.id;
      await credential.save();

      // Populate the updated credential
      const updatedCredential = await Credential.findById(credentialId)
        .populate("division", "name description")
        .populate("createdBy", "name email")
        .populate("lastUpdatedBy", "name email");

      res.json({
        message: "Credential updated successfully",
        credential: updatedCredential,
      });
    } catch (error) {
      console.error("Error updating credential:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete credential
router.delete("/:credentialId", auth, async (req, res) => {
  try {
    const { credentialId } = req.params;

    const credential = await Credential.findById(credentialId);
    if (!credential) {
      return res.status(404).json({ message: "Credential not found" });
    }

    // Only admins and creators can delete
    const canDelete =
      req.user.role === "admin" ||
      credential.createdBy.toString() === req.user.id;

    if (!canDelete) {
      return res
        .status(403)
        .json({
          message: "Insufficient permissions to delete this credential",
        });
    }

    // Check division access for non-admins
    if (
      req.user.role !== "admin" &&
      !req.user.divisions.includes(credential.division.toString())
    ) {
      return res
        .status(403)
        .json({ message: "Access denied to this division" });
    }

    await Credential.findByIdAndDelete(credentialId);

    res.json({ message: "Credential deleted successfully" });
  } catch (error) {
    console.error("Error deleting credential:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
