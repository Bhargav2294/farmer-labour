const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, mobile, village, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, mobile, village, role });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    res.json({ message: "Login successful", user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
      httpOnly: true, // Must match login cookie settings
      secure: false,  // Set to true in production (HTTPS required)
      sameSite: "Lax", // Adjust based on login settings
  });
  res.status(200).json({ message: "Logged out successfully" });
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get logged-in user ID
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ role: user.role, profile: user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update only provided fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.village = req.body.village || user.village;
    user.mobile = req.body.mobile || user.mobile;

    const updatedUser = await user.save();
    res.json({ message: "Profile updated successfully", role: user.role, profile: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



