const express = require("express");
const router = express.Router();
const Credential = require("../models/Credential");
const { auth } = require("../middleware/auth");

// Get all credentials for a division
router.get("/division/:divisionId", auth, async (req, res) => {
  try {
    const credentials = await Credential.find({
      division: req.params.divisionId,
    });
    res.json(credentials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new credential
router.post("/", auth, async (req, res) => {
  try {
    const { title, website, username, password, notes, division } = req.body;

    const credential = new Credential({
      title,
      website,
      username,
      password, // In real app, encrypt this
      notes,
      division,
      createdBy: req.user.id,
    });

    await credential.save();
    res.json({ message: "Credential added successfully", credential });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update credential
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, website, username, password, notes } = req.body;

    const credential = await Credential.findByIdAndUpdate(
      req.params.id,
      { title, website, username, password, notes },
      { new: true }
    );

    if (!credential) {
      return res.status(404).json({ message: "Credential not found" });
    }

    res.json({ message: "Credential updated successfully", credential });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete credential
router.delete("/:id", auth, async (req, res) => {
  try {
    const credential = await Credential.findByIdAndDelete(req.params.id);

    if (!credential) {
      return res.status(404).json({ message: "Credential not found" });
    }

    res.json({ message: "Credential deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single credential
router.get("/:id", auth, async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({ message: "Credential not found" });
    }

    res.json(credential);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
