const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Register Controller
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, phone, altPhone,
      companyName, businessType, category, experienceYears,
      address, landmark, area, city, state, pincode,
      pricingDetails, servicesOffered,
      gstin, pan, udyamNumber,
      bankName, accountNumber, ifsc, accountHolderName,
      isCorporate, role
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Create new user with all fields from req.body
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      altPhone,
      companyName: companyName || req.body.businessName,
      businessType,
      category,
      experienceYears,
      address,
      landmark,
      area,
      city,
      state: state || 'Uttar Pradesh',
      pincode,
      pricingDetails,
      servicesOffered,
      gstin,
      pan,
      udyamNumber,
      bankName,
      accountNumber,
      ifsc,
      accountHolderName,
      role: role || 'dealer',
      isCorporate: isCorporate || false,
      otp,
      otpExpires
    });

    await newUser.save();

    // Send OTP via Brevo API
    if (process.env.BREVO_API_KEY && process.env.EMAIL_USER) {
      const emailData = {
        sender: { name: "Tameer Fabricators", email: process.env.EMAIL_USER },
        to: [{ email: email, name: name }],
        subject: "Your OTP for Tameer Fabricators Registration",
        htmlContent: `
          <h2>Welcome to Tameer Fabricators!</h2>
          <p>Hello ${name},</p>
          <p>Your OTP for account verification is:</p>
          <h1 style="color: #2563eb;">${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        `,
      };

      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify(emailData),
      });

      const brevoData = await brevoRes.json();
      if (!brevoRes.ok) {
        console.error('Brevo Email Error:', brevoData);
      }
    } else {
      console.warn('Brevo API key or EMAIL_USER missing in environment variables.');
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Registration successful! OTP sent to your email.' 
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// 2. Verify OTP Controller
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User is already verified.' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Account verified successfully!' });

  } catch (error) {
    console.error('Verify OTP Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

// 3. Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: 'Please verify your account via OTP first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Login successful!', 
      token, 
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email, 
        companyName: user.companyName 
      } 
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// 4. Get Profile Controller
exports.getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};