const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Helper: Send Email via Brevo
const sendBrevoEmail = async (email, otp) => {
  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { email: process.env.EMAIL_USER, name: "Tameer Fabricators" },
        to: [{ email: email }],
        subject: "Your Account Verification OTP",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2>Welcome to Tameer Fabricators</h2>
            <p>Your verification OTP code is:</p>
            <h1 style="color: #2b6cb0; letter-spacing: 2px;">${otp}</h1>
            <p>This code is valid for 10 minutes.</p>
          </div>
        `
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Brevo API Error:", error.response?.data || error.message);
    throw new Error("Failed to send OTP email via Brevo");
  }
};

// Register Controller
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: "User already exists and is verified." });
      }
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      user = new User({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpires,
        isVerified: false
      });
      await user.save();
    }

    await sendBrevoEmail(email, otp);
    res.status(200).json({ success: true, message: "Registration successful. OTP sent to your email." });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify OTP Controller
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.isVerified) return res.status(400).json({ success: false, message: "User already verified." });

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully! You can now log in." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (!user.isVerified) return res.status(400).json({ success: false, message: "Please verify your email with OTP first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials." });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};