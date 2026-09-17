const User = require('../models/User');
const Lead = require('../models/Lead');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  validateEmail,
  validatePhone,
  validatePassword,
  validateName,
  verifyDomainHasMailServer
} = require('../utils/validators');

// 9. FORGOT PASSWORD - Request OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;

    let query;
    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.valid) {
        return res.status(400).json({ success: false, message: 'Invalid email address.' });
      }
      query = { email: emailCheck.value };
    } else if (phone) {
      const phoneCheck = validatePhone(phone);
      if (!phoneCheck.valid) {
        return res.status(400).json({ success: false, message: 'Invalid mobile number.' });
      }
      query = { phone: phoneCheck.value };
    } else {
      return res.status(400).json({ success: false, message: 'Email or mobile number is required.' });
    }

    const user = await User.findOne(query);

    // Don't reveal whether the account exists
    if (!user || !user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a reset OTP has been sent.'
      });
    }

    // Reuse the same OTP throttle as registration
    if (user.otpExpires) {
      const otpIssuedAt = new Date(user.otpExpires).getTime() - 10 * 60 * 1000;
      const secondsSinceLastOtp = (Date.now() - otpIssuedAt) / 1000;
      if (secondsSinceLastOtp < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceLastOtp);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} second(s) before requesting another OTP.`
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    // Mark this OTP as a reset OTP so verifyOtp (login flow) can't be reused for it
    user.otpPurpose = 'reset';
    await user.save();

    console.log(`\n[RESET OTP for ${user.email}]: ${otp}\n`);

    sendBrevoEmail({
      toEmail: user.email,
      toName: user.name,
      subject: 'Password Reset OTP - Tameer Fabricators',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #ffffff;">
          <h2 style="color: #f59e0b;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>Your OTP to reset your password is:</p>
          <h1 style="color: #f59e0b; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email and your password will remain unchanged.</p>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'If an account exists, a reset OTP has been sent.',
      email: user.email,
      ...(process.env.NODE_ENV !== 'production' ? { demoOtp: otp } : {})
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while processing request.' });
  }
};

// 10. RESET PASSWORD - Verify OTP + set new password
exports.resetPassword = async (req, res) => {
  try {
    const { email, phone, otp, newPassword } = req.body;

    if (!otp || !/^\d{6}$/.test(String(otp).trim())) {
      return res.status(400).json({ success: false, message: 'Please enter the 6-digit OTP.' });
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ success: false, field: 'newPassword', message: passwordCheck.message });
    }

    let query;
    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.valid) return res.status(400).json({ success: false, message: 'Invalid email address.' });
      query = { email: emailCheck.value };
    } else if (phone) {
      const phoneCheck = validatePhone(phone);
      if (!phoneCheck.valid) return res.status(400).json({ success: false, message: 'Invalid mobile number.' });
      query = { phone: phoneCheck.value };
    } else {
      return res.status(400).json({ success: false, message: 'Email or mobile number is required.' });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    if ((user.otpAttempts || 0) >= 5) {
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    if (!user.otpExpires || user.otpExpires < Date.now() || user.otpPurpose !== 'reset') {
      return res.status(400).json({ success: false, message: 'This OTP has expired. Please request a new one.' });
    }

    if (user.otp !== String(otp).trim()) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      const remaining = Math.max(0, 5 - user.otpAttempts);
      return res.status(400).json({
        success: false,
        message: remaining > 0 ? `Incorrect OTP. ${remaining} attempt(s) remaining.` : 'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpPurpose = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully! Please log in.' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while resetting password.' });
  }
};


// Helper: JWT Generator (30 Days Validity)
const generateToken = (id, email) => {
  return jwt.sign(
    { id, email }, 
    process.env.JWT_SECRET || 'tameer_secret_key_123', 
    { expiresIn: '30d' }
  );
};

// Helper: Brevo email sender that never throws
const sendBrevoEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_USER) return;

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'Tameer Fabricators', email: process.env.EMAIL_USER },
        to: [{ email: toEmail, name: toName || 'Recipient' }],
        subject,
        htmlContent,
      }),
    });
  } catch (err) {
    console.error(`Brevo Email Failed (${subject}):`, err.message);
  }
};

// 1. REGISTER CONTROLLER
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, companyName } = req.body;

    // ---- Field-by-field validation (fail fast with a specific message) ----
    const nameCheck = validateName(name, 'Full name');
    if (!nameCheck.valid) {
      return res.status(400).json({ success: false, field: 'name', message: nameCheck.message });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, field: 'email', message: emailCheck.message });
    }

    // Confirm the domain can actually receive mail (catches typos like
    // "gnail.com" or made-up domains). Cannot confirm the specific mailbox
    // exists - that is enforced by the OTP step below.
    const domainHasMailServer = await verifyDomainHasMailServer(emailCheck.value);
    if (!domainHasMailServer) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'This email domain does not appear to accept mail. Please check for typos.'
      });
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      return res.status(400).json({ success: false, field: 'phone', message: phoneCheck.message });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ success: false, field: 'password', message: passwordCheck.message });
    }

    // Company name is optional at registration but validated when supplied
    let cleanCompanyName = '';
    if (companyName && companyName.trim()) {
      const companyCheck = validateName(companyName, 'Workshop name');
      if (!companyCheck.valid) {
        return res.status(400).json({ success: false, field: 'companyName', message: companyCheck.message });
      }
      cleanCompanyName = companyCheck.value;
    }

    const cleanName = nameCheck.value;
    const cleanEmail = emailCheck.value;
    const cleanPhone = phoneCheck.value;

    // ---- Duplicate checks with precise messaging ----
    const emailOwner = await User.findOne({ email: cleanEmail });
    if (emailOwner && emailOwner.isVerified) {
      return res.status(409).json({ success: false, field: 'email', message: 'This email is already registered. Please log in instead.' });
    }

    const phoneOwner = await User.findOne({ phone: cleanPhone });
    if (phoneOwner && phoneOwner.isVerified) {
      return res.status(409).json({ success: false, field: 'phone', message: 'This mobile number is already registered. Please log in instead.' });
    }

    // If an unverified record exists under a different id for the other field,
    // block it so we never merge two distinct pending signups.
    if (emailOwner && phoneOwner && !emailOwner._id.equals(phoneOwner._id)) {
      return res.status(409).json({ success: false, message: 'This email and mobile number belong to different pending accounts. Please use a different combination.' });
    }

    const existingUser = emailOwner || phoneOwner;

    // ---- OTP resend throttling (prevents email bombing / abuse) ----
    if (existingUser && existingUser.otpExpires) {
      const otpIssuedAt = new Date(existingUser.otpExpires).getTime() - 10 * 60 * 1000;
      const secondsSinceLastOtp = (Date.now() - otpIssuedAt) / 1000;

      if (secondsSinceLastOtp < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceLastOtp);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} second(s) before requesting another OTP.`
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    let userRecord;

    if (existingUser) {
      // Unverified account: refresh its details and re-issue an OTP
      existingUser.name = cleanName;
      existingUser.email = cleanEmail;
      existingUser.phone = cleanPhone;
      if (cleanCompanyName) existingUser.companyName = cleanCompanyName;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      existingUser.otpAttempts = 0;
      await existingUser.save();
      userRecord = existingUser;
    } else {
      userRecord = new User({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        companyName: cleanCompanyName || undefined,
        password: hashedPassword,
        otp,
        otpExpires,
        otpAttempts: 0,
        isVerified: false,
        isPhoneVerified: false,
        isSubscribed: false,
        isProfileComplete: false
      });
      await userRecord.save();
    }

    console.log(`\n========================================`);
    console.log(`[DEMO OTP for ${cleanPhone} / ${cleanEmail}]: ${otp}`);
    console.log(`========================================\n`);

    sendBrevoEmail({
      toEmail: cleanEmail,
      toName: cleanName,
      subject: 'Your Verification OTP - Tameer Fabricators',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #ffffff;">
          <h2 style="color: #f59e0b;">Tameer Fabricators Partner Verification</h2>
          <p>Hello ${cleanName},</p>
          <p>Your OTP for account verification is:</p>
          <h1 style="color: #f59e0b; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Registration successful! OTP sent to your email.',
      email: cleanEmail,
      // Demo OTP is only exposed outside production
      ...(process.env.NODE_ENV !== 'production' ? { demoOtp: otp } : {})
    });

  } catch (error) {
    console.error('Registration Error:', error);

    // Handle Mongo duplicate-key races gracefully
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'account';
      return res.status(409).json({ success: false, message: `This ${field} is already registered.` });
    }

    return res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
  }
};

// 2. VERIFY OTP CONTROLLER
exports.verifyOtp = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (!otp || !/^\d{6}$/.test(String(otp).trim())) {
      return res.status(400).json({ success: false, message: 'Please enter the 6-digit OTP.' });
    }

    let query;
    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.valid) {
        return res.status(400).json({ success: false, message: 'Invalid email address.' });
      }
      query = { email: emailCheck.value };
    } else if (phone) {
      const phoneCheck = validatePhone(phone);
      if (!phoneCheck.valid) {
        return res.status(400).json({ success: false, message: 'Invalid mobile number.' });
      }
      query = { phone: phoneCheck.value };
    } else {
      return res.status(400).json({ success: false, message: 'Email or mobile number is required.' });
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found. Please register first.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This account is already verified. Please log in.' });
    }

    // Brute-force protection: lock after 5 wrong attempts on the same OTP
    if ((user.otpAttempts || 0) >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    if (!user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'This OTP has expired. Please request a new one.' });
    }

    if (user.otp !== String(otp).trim()) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();

      const remaining = Math.max(0, 5 - user.otpAttempts);
      return res.status(400).json({
        success: false,
        message: remaining > 0
          ? `Incorrect OTP. ${remaining} attempt(s) remaining.`
          : 'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    user.isVerified = true;
    user.isPhoneVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
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
        companyName: user.companyName,
        isSubscribed: user.isSubscribed,
        isProfileComplete: user.isProfileComplete
      }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during verification.' });
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

    // Validate pincode when provided
    if (pincode && !/^\d{6}$/.test(String(pincode).trim())) {
      return res.status(400).json({ success: false, field: 'pincode', message: 'Pincode must be 6 digits.' });
    }

    // Validate GSTIN format when provided (15 chars, standard Indian format)
    if (gstin && gstin.trim() && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gstin.trim().toUpperCase())) {
      return res.status(400).json({ success: false, field: 'gstin', message: 'Please enter a valid 15-character GSTIN.' });
    }

    // Validate PAN format when provided
    if (pan && pan.trim() && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(pan.trim().toUpperCase())) {
      return res.status(400).json({ success: false, field: 'pan', message: 'Please enter a valid 10-character PAN.' });
    }

    if (perKgPrice !== undefined && perKgPrice !== null && perKgPrice !== '') {
      const numericPrice = Number(perKgPrice);
      if (isNaN(numericPrice) || numericPrice <= 0 || numericPrice > 100000) {
        return res.status(400).json({ success: false, field: 'perKgPrice', message: 'Please enter a valid per-kg price.' });
      }
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
    const { email, phone, password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    let query;
    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.valid) {
        return res.status(400).json({ success: false, message: 'Invalid email or password.' });
      }
      query = { email: emailCheck.value };
    } else if (phone) {
      const phoneCheck = validatePhone(phone);
      if (!phoneCheck.valid) {
        return res.status(400).json({ success: false, message: 'Invalid mobile number or password.' });
      }
      query = { phone: phoneCheck.value };
    } else {
      return res.status(400).json({ success: false, message: 'Email or mobile number is required.' });
    }

    const user = await User.findOne(query);

    // Generic message on purpose: never reveal whether the account exists
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check and try again.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your account via OTP first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check and try again.' });
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
        phone: user.phone,
        companyName: user.companyName,
        isSubscribed: user.isSubscribed,
        isProfileComplete: user.isProfileComplete
      } 
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
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

// 7. UPDATE PER KG PRICE CONTROLLER (Dealer Self-Service)
exports.updatePrice = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { perKgPrice } = req.body;

    if (perKgPrice === undefined || perKgPrice === null || perKgPrice === '') {
      return res.status(400).json({ success: false, message: 'Per KG price is required.' });
    }

    const numericPrice = Number(perKgPrice);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid positive price.' });
    }

    if (numericPrice > 100000) {
      return res.status(400).json({ success: false, message: 'Price seems unrealistically high. Please check the value.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.perKgPrice = numericPrice;
    await user.save();

    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    delete sanitizedUser.otp;

    return res.status(200).json({
      success: true,
      message: 'Price updated successfully!',
      user: sanitizedUser
    });

  } catch (error) {
    console.error('Update Price Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error while updating price' });
  }
};

// 8. GET MY LEADS CONTROLLER (Dealer Notifications)
exports.getMyLeads = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const leads = await Lead.find({ dealer: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leads.length,
      unreadCount: leads.filter((lead) => !lead.isRead).length,
      leads
    });

  } catch (error) {
    console.error('Get My Leads Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error while fetching leads' });
  }
};