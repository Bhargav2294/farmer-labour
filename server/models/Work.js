const mongoose = require("mongoose");

const workSchema = new mongoose.Schema({
  labourId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  labourName: { type: String, required: true },
  village: { type: String, required: true },
  workType: { type: String, required: true },
  date: { type: Date, required: true },
  dailyCharge: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  farmerEmail: { type: String, default: null },
  farmerMobile: { type: String, default: null }
});

module.exports = mongoose.model("Work", workSchema);
