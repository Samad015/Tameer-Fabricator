const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Register Controller
exports.register = async (req, res) => {
  try {
    const {
      name, companyName, address, phone, email, password,
      isCorporate, gstin, pan, udyamNumber, aadhaarNumber,
      accountNumber, ifsc, accountHolderName, bankName
    } = req.body;

    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (user && !user.isVerified) {
      user.name = name;
      user.companyName = companyName;
      user.address = address;
      user.phone = phone;
      user.password = hashedPassword;
      user.isCorporate = isCorporate;
      user.gstin = gstin;
      user.pan = pan;
      user.udyamNumber = udyamNumber;
      user.aadhaarNumber = aadhaarNumber;
      user.accountNumber = accountNumber;
      user.ifsc = ifsc;
      user.accountHolderName = accountHolderName;
      user.bankName = bankName;
      user.otp = otp;
      user.otpExpires = otpExpires;
    } else {
      user = new User({
        name, companyName, address, phone, email,
        password: hashedPassword, isCorporate, gstin,
        pan, udyamNumber, aadhaarNumber, accountNumber,
        ifsc, accountHolderName, bankName, otp, otpExpires
      });
    }

    await user.save();

    const emailData = {
      sender: { name: "Tameer Fabricators", email: process.env.EMAIL_USER },
      to: [{ email: email, name: name }],
      subject: "Verify Your Account - OTP Code",
      htmlContent: `
        <h2>Welcome to Tameer Fabricator's Portal</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your OTP for registration is:</p>
        <h1 style="color: #d97706; letter-spacing: 3px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      `
    };

    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify(emailData),
    });

    if (!emailResponse.ok) {
      const errData = await emailResponse.json();
      throw new Error(errData.message || 'Failed to send OTP email via Brevo');
    }

    res.status(200).json({ success: true, message: 'Registration successful. OTP sent to email.' });

  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
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