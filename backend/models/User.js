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

  // Pricing & Services Catalog
  pricingDetails: { type: String, required: true },
  servicesOffered: { type: String },

  // Legal & Tax Compliance
  gstin: { type: String, uppercase: true, trim: true },
  pan: { type: String, required: true, uppercase: true, trim: true },
  udyamNumber: { type: String },

  // Bank Account Details for Payouts
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifsc: { type: String, required: true, uppercase: true, trim: true },
  accountHolderName: { type: String, required: true },

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