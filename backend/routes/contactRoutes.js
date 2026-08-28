const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("Contact form data:", req.body);

    const {
      name,
      phone,
      width,
      height,
      message
    } = req.body;

    // Required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill your name and phone number"
      });
    }

    // Here you can later add:
    // - MongoDB
    // - Email notification
    // - WhatsApp notification
    // - Lead creation

    console.log("New quote request:", {
      name,
      phone,
      width,
      height,
      message
    });

    return res.status(200).json({
      success: true,
      message: "Quote request submitted successfully"
    });

  } catch (error) {
    console.error("Contact Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
});

module.exports = router;