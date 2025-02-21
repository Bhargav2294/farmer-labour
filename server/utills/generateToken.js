// utils/generateToken.js

const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Generates a JWT token for authentication
 * @param {string} userId - The user ID to include in the token
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

module.exports = generateToken;
