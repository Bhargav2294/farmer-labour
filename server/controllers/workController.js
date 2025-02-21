const Work = require("../models/Work");

const getAvailableLabourers = async (req, res) => {
  try {
    const availableLabourers = await Work.find({ availability: true })
      .populate("labourId", "name email village");

    res.json(availableLabourers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const addWork = async (req, res) => {
  try {
    const { labourId, labourName, village, workType, date, dailyCharge } = req.body;

    // Validate request body
    if (!labourId || !labourName || !village || !workType || !date || !dailyCharge) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Create a new work entry
    const newWork = new Work({
      labourId,
      labourName,
      village,
      workType,
      date,
      dailyCharge,
      availability: true, // Always true when adding new work
      bookedBy: null,
      farmerEmail: null,
      farmerMobile: null
    });

    // Save work to database
    await newWork.save();

    res.status(201).json({ message: "Work added successfully!", work: newWork });
  } catch (error) {
    console.error("Error adding work:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const bookWork = async (req, res) => {
  try {
    const workId = req.params.id; // Extract work ID from URL
    const { farmerId, farmerEmail, farmerMobile } = req.body; // Extract farmer details

    // Validate input
    if (!farmerId || !farmerEmail || !farmerMobile) {
      return res.status(400).json({ error: "Farmer ID, email, and mobile are required." });
    }

    // Check if the work entry exists
    let work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ error: "Work not found" });
    }

    // Check if already booked
    if (work.bookedBy) {
      return res.status(400).json({ error: "Work is already booked" });
    }

    // Update the work entry with farmer's details
    work.bookedBy = farmerId;
    work.farmerEmail = farmerEmail;
    work.farmerMobile = farmerMobile;
    work.availability = false; // Mark as booked

    await work.save();

    res.json({ message: "Work booked successfully", work });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { addWork, getAvailableLabourers, bookWork };
