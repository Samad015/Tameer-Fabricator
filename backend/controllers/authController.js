const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper: JWT Generator (30 Days Validity)
const generateToken = (id, email) => {
  return jwt.sign(
    { id, email }, 
    process.env.JWT_SECRET || 'tameer_secret_key_123', 
    { expiresIn: '30d' }
  );
};

// 1. REGISTER CONTROLLER
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields (name, email, phone, password) are required.' });
    }

    let existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ success: false, message: 'Email or Phone is already registered and verified.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.email = email;
      existingUser.phone = phone;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
    } else {
      existingUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        otp,
        otpExpires,
        isVerified: false,
        isPhoneVerified: false,
        isSubscribed: false,
        isProfileComplete: false
      });
      await existingUser.save();
    }

    console.log(`\n========================================`);
    console.log(`[DEMO OTP for ${phone} / ${email}]: ${otp}`);
    console.log(`========================================\n`);

    if (process.env.BREVO_API_KEY && process.env.EMAIL_USER) {
      try {
        const emailData = {
          sender: { name: "Tameer Fabricators", email: process.env.EMAIL_USER },
          to: [{ email: email, name: name }],
          subject: "Your Verification OTP - Tameer Fabricators",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #ffffff;">
              <h2 style="color: #f59e0b;">Tameer Fabricators Partner Verification</h2>
              <p>Hello ${name},</p>
              <p>Your OTP for account verification is:</p>
              <h1 style="color: #f59e0b; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
              <p>This OTP is valid for 10 minutes.</p>
            </div>
          `,
        };

        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
          },
          body: JSON.stringify(emailData),
        });
      } catch (emailErr) {
        console.error('Brevo Email Delivery Failed:', emailErr.message);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Registration successful! OTP sent to your email/phone.',
      demoOtp: otp 
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// 2. VERIFY OTP CONTROLLER
exports.verifyOtp = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    const query = email ? { email } : { phone };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({ success: false, message: 'User account not found.' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    user.isPhoneVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id, user.email);

    return res.status(200).json({ 
      success: true, 
      message: 'Account verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isSubscribed: user.isSubscribed,
        isProfileComplete: user.isProfileComplete
      }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Server error during verification' });
  }
};

// 3. PROCESS SUBSCRIPTION CONTROLLER
exports.processSubscription = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { paymentId, orderId, paymentMethod } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const subscribedAt = new Date();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    user.isSubscribed = true;
    user.subscriptionDetails = {
      planAmount: 999,
      paymentId: paymentId || `DEMO_PAY_${Date.now()}`,
      orderId: orderId || `DEMO_ORD_${Date.now()}`,
      paymentMethod: paymentMethod || 'Demo/Razorpay Modal',
      subscribedAt,
      expiresAt
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Subscription activated successfully for 30 days!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSubscribed: user.isSubscribed,
        isProfileComplete: user.isProfileComplete,
        subscriptionDetails: user.subscriptionDetails
      }
    });

  } catch (error) {
    console.error('Subscription Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to activate subscription' });
  }
};

// 4. COMPLETE DEALER PROFILE CONTROLLER
exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const {
      companyName, businessName, businessType, category, experienceYears,
      address, landmark, area, city, state, pincode,
      perKgPrice, pricingDetails, pricingHighlight, servicesOffered, services,
      gstin, pan, udyamNumber
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Update Profile Fields with Frontend Alias Fallbacks
    user.companyName = companyName || businessName || user.companyName || user.name;
    user.businessType = businessType || user.businessType;
    user.category = category || user.category;
    user.experienceYears = experienceYears ? String(experienceYears) : user.experienceYears;
    user.address = address || user.address;
    user.landmark = landmark || user.landmark;
    user.area = area || user.area;
    user.city = city || user.city;
    user.state = state || user.state || 'Uttar Pradesh';
    user.pincode = pincode || user.pincode;
    user.perKgPrice = perKgPrice ? Number(perKgPrice) : user.perKgPrice;
    user.pricingDetails = pricingDetails || pricingHighlight || user.pricingDetails;
    user.servicesOffered = servicesOffered || services || user.servicesOffered;
    user.gstin = gstin || user.gstin;
    user.pan = pan || user.pan;
    user.udyamNumber = udyamNumber || user.udyamNumber;

    user.isProfileComplete = true;
    await user.save();

    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    delete sanitizedUser.otp;

    return res.status(200).json({
      success: true,
      message: 'Dealer workshop profile completed successfully!',
      user: sanitizedUser
    });

  } catch (error) {
    console.error('Complete Profile Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error while updating profile' });
  }
};

// 5. LOGIN CONTROLLER
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

    const token = generateToken(user._id, user.email);

    return res.status(200).json({ 
      success: true, 
      message: 'Login successful!', 
      token, 
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email, 
        companyName: user.companyName,
        isSubscribed: user.isSubscribed,
        isProfileComplete: user.isProfileComplete
      } 
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// 6. GET ME / GET PROFILE CONTROLLER
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('-password -otp');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};