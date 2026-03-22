const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../model/user");
const authMiddleware = require("../middleware/auth");

const JWT_SECRET =
  process.env.JWT_SECRET || "your_secret_key_change_in_production_for_security";

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET current user profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// REGISTER a new user
router.post("/register", async (req, res) => {
  const { name, email, password, job } = req.body;
  if (!name || !email || !password || !job) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const user = new User({
      name,
      email,
      password,
      job,
    });
    const newUser = await user.save();
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(201).json({
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        job: newUser.job,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// LOGIN user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        job: user.job,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
