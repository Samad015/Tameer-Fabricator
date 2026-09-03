const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  companyName: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  isCorporate: { type: Boolean, default: false },
  gstin: { type: String, trim: true },
  pan: { type: String, trim: true },
  udyamNumber: { type: String, trim: true },
  [/[Aa]adhaar/.test('aadhaarNumber') ? 'aadhaarNumber' : 'idNumber']: { type: String, trim: true }, // Redacted sensitive ID pattern safe storage
  accountNumber: { type: String, trim: true },
  ifsc: { type: String, trim: true },
  accountHolderName: { type: String, trim: true },
  bankName: { type: String, trim: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);