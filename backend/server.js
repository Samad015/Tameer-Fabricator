const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

console.log("EMAIL USER:", process.env.EMAIL_USER);
console.log("EMAIL PASS EXISTS:", !!process.env.EMAIL_PASS);

const app = express();

// ==================== CORS ====================
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== TEST ROUTE ====================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working!",
  });
});

// ==================== EMAIL CONFIG ====================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==================== CONTACT API ====================

app.post("/api/contact", async (req, res) => {
  try {
    console.log("Contact form data:", req.body);

    const {
      name,
      phone,
      width,
      height,
      message,
    } = req.body;

    // Required fields
    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // ==================== EMAIL ====================

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `New Website Enquiry - ${name}`,

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">

          <h2 style="color: #333;">
            New Website Contact Enquiry
          </h2>

          <hr />

          <p>
            <strong>Name:</strong> ${name}
          </p>

          <p>
            <strong>Phone:</strong> ${phone}
          </p>

          <p>
            <strong>Width:</strong> ${width || "Not provided"}
          </p>

          <p>
            <strong>Height:</strong> ${height || "Not provided"}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <p>
            ${message}
          </p>

          <hr />

          <p style="color: #777;">
            This enquiry was submitted from your website.
          </p>

        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully");

    return res.status(200).json({
      success: true,
      message: "Your enquiry has been sent successfully!",
    });

  } catch (error) {

    console.error("❌ Email Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send enquiry",
    });
  }
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ==================== SERVER ====================

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});