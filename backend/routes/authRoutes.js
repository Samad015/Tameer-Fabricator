const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Lead = require('../models/Lead');
const verifyToken = require('../middleware/verifyToken');

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'tameer_secret_key_123',
    { expiresIn: '7d' }
  );
};

// 1. REGISTER DEALER
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, companyName, password, role } = req.body;

    if (!name || !email || !phone || !password || !companyName) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      return res.status(400).json({ success: false, message: 'User with this email or phone already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user = new User({
      name,
      email,
      phone,
      companyName,
      password: hashedPassword,
      role: role || 'dealer',
      otp,
      otpExpires,
      isVerified: false,
      isSubscribed: false,
      isProfileComplete: false
    });

    await user.save();

    // Send OTP via Brevo if configured
    if (process.env.BREVO_API_KEY && process.env.EMAIL_USER) {
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
          },
          body: JSON.stringify({
            sender: { name: "Tameer Fabricators", email: process.env.EMAIL_USER },
            to: [{ email: user.email, name: user.name }],
            subject: "Verify Your Email - Tameer Fabricators",
            htmlContent: `<h3>Your Email Verification OTP</h3><p>Your 6-digit verification code is: <strong>${otp}</strong></p>`
          }),
        });
      } catch (emailErr) {
        console.error('OTP Email Send Failed:', emailErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email with the OTP sent.',
      email: user.email
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// 2. VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isVerified) {
      const token = generateToken(user);
      return res.status(200).json({ success: true, message: 'Already verified.', token, user });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user);
    return res.status(200).json({ success: true, message: 'Email verified successfully!', token, user });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
  }
});

// 3. LOGIN DEALER
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const query = email ? { email } : { phone };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user);
    return res.status(200).json({ success: true, message: 'Logged in successfully', token, user });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// 4. ACTIVATE SUBSCRIPTION
router.post('/subscribe', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isSubscribed = true;
    await user.save();

    return res.status(200).json({ success: true, message: 'Subscription activated successfully!', user });
  } catch (error) {
    console.error('Subscription Error:', error);
    return res.status(500).json({ success: false, message: 'Server error activating subscription.' });
  }
});

// 5. COMPLETE PROFILE
router.put('/complete-profile', verifyToken, async (req, res) => {
  try {
    const {
      businessType, experienceYears, address, area, city,
      state, pincode, perKgPrice, pricingHighlight, services, gstin, pan
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.businessType = businessType || user.businessType;
    user.experienceYears = experienceYears || user.experienceYears;
    user.address = address || user.address;
    user.area = area || user.area;
    user.city = city || user.city;
    user.state = state || user.state;
    user.pincode = pincode || user.pincode;
    user.perKgPrice = perKgPrice || user.perKgPrice;
    user.pricingDetails = pricingHighlight || user.pricingDetails;
    user.servicesOffered = services || user.servicesOffered;
    user.gstin = gstin || user.gstin;
    user.pan = pan || user.pan;
    user.isProfileComplete = true;

    await user.save();

    return res.status(200).json({ success: true, message: 'Workshop profile completed successfully!', user });
  } catch (error) {
    console.error('Complete Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Server error completing profile.' });
  }
});

// 6. GET CURRENT USER SESSION
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Fetch User Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
};

router.get('/me', verifyToken, getCurrentUser);
router.get('/profile', verifyToken, getCurrentUser);

// 7. GET DEALER LEADS
router.get('/my-leads', verifyToken, async (req, res) => {
  try {
    const leads = await Lead.find({ dealer: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: leads.length, leads });
  } catch (error) {
    console.error('Fetch Leads Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching leads.' });
  }
});

// 8. UPDATE PER KG PRICE
router.put('/update-price', verifyToken, async (req, res) => {
  try {
    const { perKgPrice } = req.body;
    if (!perKgPrice) {
      return res.status(400).json({ success: false, message: 'Per KG price is required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.perKgPrice = perKgPrice;
    await user.save();

    return res.status(200).json({ success: true, message: 'Price updated successfully!', user });
  } catch (error) {
    console.error('Update Price Error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating price.' });
  }
});

// 9. FORGOT PASSWORD (SEND OTP)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
    await user.save();

    // Send Reset OTP via Brevo
    if (process.env.BREVO_API_KEY && process.env.EMAIL_USER) {
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
          },
          body: JSON.stringify({
            sender: { name: "Tameer Fabricators", email: process.env.EMAIL_USER },
            to: [{ email: user.email, name: user.name }],
            subject: "Password Reset OTP - Tameer Fabricators",
            htmlContent: `<h3>Password Reset Code</h3><p>Your 6-digit password reset code is: <strong>${otp}</strong></p>`
          }),
        });
      } catch (emailErr) {
        console.error('Reset OTP Email Send Failed:', emailErr.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Password reset OTP sent to email.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during password reset request.' });
  }
});

// 10. RESET PASSWORD (VERIFY OTP & SAVE NEW PASSWORD)
// 10. RESET PASSWORD (VERIFY OTP & SAVE NEW PASSWORD)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check OTP and Expiry
    if (!user.otp || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ success: false, message: 'Server error resetting password.' });
  }
});

module.exports = router;

module.exports = router;