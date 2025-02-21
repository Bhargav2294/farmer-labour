const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  village: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["farmer", "labour"], required: true }
});

module.exports = mongoose.model("User", userSchema);
