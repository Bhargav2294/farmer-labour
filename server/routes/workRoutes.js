const express = require("express");
const { getAvailableLabourers,addWork,bookWork,getBookedWorks,getLabourWorkStatus } = require("../controllers/workController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/available-labour", authMiddleware, getAvailableLabourers);
router.post("/add", authMiddleware, addWork);
router.put("/book/:id", authMiddleware, bookWork);
router.get("/booked", authMiddleware, getBookedWorks);
router.get("/labour-work", authMiddleware, getLabourWorkStatus);

module.exports = router;
