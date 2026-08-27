const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ==================== CORS ====================
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== TEST ROUTE ====================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Tameer Fabricator Backend is running",
  });
});

// ==================== CONTACT ROUTE ====================
const contactRoutes = require("./routes/contactRoutes");

app.use("/api/contact", contactRoutes);

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ==================== SERVER ====================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});