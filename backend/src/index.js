require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const booksRouter = require("./routes/books");
const categoriesRouter = require("./routes/categories");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/books", booksRouter);
app.use("/api/categories", categoriesRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
