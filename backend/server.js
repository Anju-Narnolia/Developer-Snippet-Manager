const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const snippetRoutes = require("./routes/snippetRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

// ✅ FIXED CONNECTION
const connectDB = async () => {
  while (true) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("✅ MongoDB Connected");
      break;
    } catch (err) {
      console.error("❌ MongoDB Connection Error:", err.message);
      console.log("🔁 Retrying in 5 seconds...");
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

connectDB();

app.use("/api/snippets", snippetRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Snippet Manager API");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});