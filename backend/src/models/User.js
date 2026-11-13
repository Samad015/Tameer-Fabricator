const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 1. Personal & Auth Info
  name: { type: String, required: true, trim: true, maxlength: 500 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 500 },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true, trim: true, maxlength: 500 },
  altPhone: { type: String, trim: true, maxlength: 500 },

  // 2. OTP & Verification Status
  isPhoneVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpPurpose: {type:String,enum:['verify','reset']},
  tokenVersion: {type:Number,default:0},
  location: { latitude:{type:Number,min:-90,max:90}, longitude:{type:Number,min:-180,max:180}, accuracy:{type:Number,min:0}, source:{type:String,enum:['gps','manual']}, capturedAt:Date },
  otpExpires: { type: Date },
  otpAttempts: { type: Number, default: 0 }, // Brute-force protection counter

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
  companyName: { type: String, trim: true, maxlength: 500 },
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
  perKgPrice: { type: Number, min: 0.01, max: 100000 }, // Dealer per-kg rate
  pricingDetails: { type: String },
  servicesOffered: { type: String },

  // 7. Legal & Tax Compliance
  gstin: { type: String, uppercase: true, trim: true, maxlength: 500 },
  pan: { type: String, uppercase: true, trim: true, maxlength: 500 },
  udyamNumber: { type: String, trim: true, maxlength: 500 },

  // 8. Bank Account Details for Payouts
  bankName: { type: String },
  accountNumber: { type: String },
  ifsc: { type: String, uppercase: true, trim: true, maxlength: 500 },
  accountHolderName: { type: String },

  // 9. Role & Admin Flags
  role: { type: String, enum: ['dealer', 'customer', 'admin'], default: 'dealer' },
  isCorporate: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false } // Admin verification status

}, { timestamps: true, toJSON: {transform(doc,ret) { for(const key of ['password','otp','otpExpires','otpAttempts','otpPurpose','tokenVersion','bankName','accountNumber','ifsc','accountHolderName']) delete ret[key]; return ret; }} });
userSchema.index({role:1,isSubscribed:1,isProfileComplete:1,city:1});

module.exports = mongoose.model('User', userSchema);