const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Personal & Auth Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  altPhone: { type: String },

  // Business & Enterprise Profile
  companyName: { type: String, required: true },
  businessType: { type: String, default: 'Proprietorship' },
  category: { type: String, default: 'Rolling Shutters & Gates' },
  experienceYears: { type: String },

  // Location Details (For Customer Search & Dashboard Mapping)
  address: { type: String, required: true },
  landmark: { type: String },
  area: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: 'Uttar Pradesh' },
  pincode: { type: String, required: true, index: true }, // Index for fast location search

  // Pricing & Services Catalog (Made optional)
  pricingDetails: { type: String },
  servicesOffered: { type: String },

  // Legal & Tax Compliance (PAN and GSTIN made optional or adjusted)
  gstin: { type: String, uppercase: true, trim: true },
  pan: { type: String, uppercase: true, trim: true },
  udyamNumber: { type: String },

  // Bank Account Details for Payouts (Made optional since Section 6 is commented out)
  bankName: { type: String },
  accountNumber: { type: String },
  ifsc: { type: String, uppercase: true, trim: true },
  accountHolderName: { type: String },

  // Role & Verification Status
  role: { type: String, enum: ['dealer', 'customer', 'admin'], default: 'dealer' },
  isCorporate: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }, // Admin verification
  isSubscriptionActive: { type: Boolean, default: false }, // Payment/Subscription status

  // OTP Verification Fields
  otp: { type: String },
  otpExpires: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);