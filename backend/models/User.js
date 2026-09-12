const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 1. Personal & Auth Info
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true, trim: true },
  altPhone: { type: String, trim: true },

  // 2. OTP & Verification Status
  isPhoneVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },

  // 3. Subscription Management (₹999/month tracking)
  isSubscribed: { type: Boolean, default: false },
  subscriptionDetails: {
    planAmount: { type: Number, default: 999 },
    paymentId: { type: String },
    orderId: { type: String },
    paymentMethod: { type: String, default: 'Demo/Razorpay' },
    subscribedAt: { type: Date },
    expiresAt: { type: Date }
  },

  // 4. Workshop & Business Profile (Completed on Step 4)
  isProfileComplete: { type: Boolean, default: false },
  companyName: { type: String, trim: true },
  businessType: { type: String, default: 'Proprietorship' },
  category: { type: String, default: 'Rolling Shutters & Gates' },
  experienceYears: { type: String },

  // 5. Location Details (Indexed for Fast Customer Matching)
  address: { type: String },
  landmark: { type: String },
  area: { type: String },
  city: { type: String, index: true },
  state: { type: String, default: 'Uttar Pradesh' },
  pincode: { type: String, index: true },

  // 6. Pricing & Services Catalog
  perKgPrice: { type: Number }, // Dealer per-kg rate
  pricingDetails: { type: String },
  servicesOffered: { type: String },

  // 7. Legal & Tax Compliance
  gstin: { type: String, uppercase: true, trim: true },
  pan: { type: String, uppercase: true, trim: true },
  udyamNumber: { type: String, trim: true },

  // 8. Bank Account Details for Payouts
  bankName: { type: String },
  accountNumber: { type: String },
  ifsc: { type: String, uppercase: true, trim: true },
  accountHolderName: { type: String },

  // 9. Role & Admin Flags
  role: { type: String, enum: ['dealer', 'customer', 'admin'], default: 'dealer' },
  isCorporate: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false } // Admin verification status

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);