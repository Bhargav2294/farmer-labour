const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

connectDB();

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/work", require("./routes/workRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));
