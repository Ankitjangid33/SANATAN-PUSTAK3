const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const crypto = require("crypto");

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!admin.verifyPassword(password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate simple token (for production, use JWT)
    const token = crypto.randomBytes(32).toString("hex");

    res.json({
      success: true,
      message: "Login successful",
      token,
      username: admin.username,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create initial admin (run once to set up)
router.post("/setup", async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Hash password manually to avoid pre-save hook issues
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");

    const admin = new Admin({
      username,
      password: hashedPassword,
      salt,
    });
    await admin.save({ validateBeforeSave: false });

    res.json({ success: true, message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if admin exists
router.get("/check", async (req, res) => {
  try {
    const admin = await Admin.findOne();
    res.json({ adminExists: !!admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
