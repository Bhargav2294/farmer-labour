const jwt = require("jsonwebtoken");
const Farmer = require("../models/User"); // Import Farmer model

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const farmer = await Farmer.findById(decoded.id); // Fetch farmer details from DB

    if (!farmer) {
      return res.status(401).json({ error: "Farmer not found" });
    }

    req.user = {
      id: farmer._id,
      email: farmer.email,
      mobile: farmer.mobile,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
