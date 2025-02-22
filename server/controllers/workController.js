const Work = require("../models/Work");
const User = require("../models/User"); // Make sure this path is correct

const getAvailableLabourers = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: No user data" });
    }

    const farmerId = req.user.id;
    const farmer = await User.findById(farmerId); // ✅ Fetch farmer details

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    const availableLabourers = await Work.find({
      availability: true,
      village: farmer.village, // ✅ Filter laborers by farmer's village
    }).populate("labourId", "name email village");

    res.json(availableLabourers);
  } catch (error) {
    console.error("Error fetching available labourers:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
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

    // Get farmer details from the logged-in user (req.user set by authMiddleware)
    const farmerId = req.user.id;
    const farmerEmail = req.user.email;
    const farmerMobile = req.user.mobile;

    // Check if farmer details exist
    if (!farmerId || !farmerEmail || !farmerMobile) {
      return res.status(400).json({ error: "Unauthorized: Farmer details not found" });
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

    // Update the work entry with the farmer's details
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

const getBookedWorks = async (req, res) => {
  try {
    const farmerId = req.user.id; // Get logged-in farmer's ID

    // Find all works booked by this farmer, sorted by latest booking first
    const bookedWorks = await Work.find({ bookedBy: farmerId })
      .populate("labourId", "name email village workType")
      .sort({ date: -1 }); // Sort by date (latest first)

    res.json(bookedWorks);
  } catch (error) {
    console.error("Error fetching booked works:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getLabourWorkStatus = async (req, res) => {
  try {
    const labourId = req.user.id; // Get logged-in labourer's ID

    // Find all works added by this labourer
    const allWorks = await Work.find({ labourId });

    // Separate booked and pending works
    const pendingWorks = allWorks.filter(work => work.availability === true);
    const bookedWorks = allWorks.filter(work => work.availability === false);

    res.json({
      totalWorks: allWorks.length,
      pendingWorks,
      bookedWorks,
    });
  } catch (error) {
    console.error("Error fetching labour work status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



module.exports = { addWork, getAvailableLabourers, bookWork,getBookedWorks,getLabourWorkStatus };
