import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, User, Building2, MapPin, Phone, 
  FileText, CreditCard, ShieldCheck, Eye, EyeOff, Briefcase, Landmark 
} from 'lucide-react';

export function AuthCard({ mode = 'login', onNavigate }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCorporate, setIsCorporate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentMode, setCurrentMode] = useState(mode);
  const [step, setStep] = useState(mode === 'verify-otp' ? 2 : 1);
  const [otp, setOtp] = useState('');

  // Comprehensive state covering business, location, legal compliance, and payout details
  const [formData, setFormData] = useState({
    // Personal & Auth Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    altPhone: '',

    // Business Profile
    businessName: '',
    businessType: 'Proprietorship', // Proprietorship, Partnership, Private Limited, etc.
    category: 'Rolling Shutters & Gates', // Core manufacturing/fabrication domain
    experienceYears: '',

    // Location Details (Crucial for Local Dealer Dashboard Mapping)
    address: '',
    landmark: '',
    area: '',           // e.g., Civil Lines
    city: '',           // e.g., Bareilly
    state: 'Uttar Pradesh',
    pincode: '',        // e.g., 243001

    // Pricing & Offerings Info
    pricingDetails: '', // e.g., Motorized Rolling Shutters @ ₹280/sq ft onwards
    servicesOffered: '', // e.g., Installation, Repair, Custom Fabrication

    // Legal & Tax Compliance
    gstin: '',
    pan: '',
    udyamNumber: '',
    aadhaarOrIdRef: '',

    // Bank Account Details for Payouts / Financials
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    accountHolderName: ''
  });

  const isLogin = currentMode === 'login';
  const isVerifyOtpMode = currentMode === 'verify-otp';

  const goTo = (nextPath) => {
    setCurrentMode(nextPath);
    if (nextPath === 'login') navigate('/login');
    else if (nextPath === 'signup') navigate('/register');
    else if (nextPath === 'verify-otp') navigate('/verify-otp');
    if (onNavigate) onNavigate(nextPath);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await response.json();

      if (data.success) {
        alert('Login Successful!');
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login Error:', err);
      alert('Something went wrong during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      alert('Bank Account numbers do not match!');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyName: formData.businessName,
          role: 'dealer',
          isCorporate
        })
      });
      const data = await response.json();

      if (data.success) {
        alert('Registration successful! OTP sent to your email.');
        sessionStorage.setItem('verifyEmail', formData.email);
        goTo('verify-otp');
        setStep(2);
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Register Error:', err);
      alert('Something went wrong during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const targetEmail = formData.email || sessionStorage.getItem('verifyEmail');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, otp })
      });
      const data = await response.json();

      if (data.success) {
        alert('Email verified successfully! Please log in.');
        sessionStorage.removeItem('verifyEmail');
        goTo('login');
        setStep(1);
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('OTP Verify Error:', err);
      alert('Something went wrong during OTP verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden py-10">
      <div className={`relative w-full ${isLogin || isVerifyOtpMode || step === 2 ? 'max-w-md' : 'max-w-4xl'} bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8`}>
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          {isLogin ? 'Dealer Login' : (isVerifyOtpMode || step === 2) ? 'Verify OTP' : 'Complete Dealer Onboarding'}
        </h2>
        <p className="text-center text-slate-400 text-sm mb-8">
          {!isLogin && !isVerifyOtpMode && step !== 2 && 'Register your workshop or business to receive local customer requests instantly.'}
        </p>

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div className="relative mb-4">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="relative mb-3">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-11 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase transition mt-4 mb-6">
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <p className="text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <button type="button" onClick={() => goTo('signup')} className="text-amber-500 font-semibold hover:underline">Register Now</button>
            </p>
          </form>
        ) : isVerifyOtpMode || step === 2 ? (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-sm text-slate-300 mb-4 text-center">
              Please enter the 6-digit OTP sent to <span className="text-amber-400">{formData.email || sessionStorage.getItem('verifyEmail')}</span>
            </p>
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3.5 text-white text-center text-lg tracking-widest focus:outline-none focus:border-amber-500"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase transition mb-6">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* SECTION 1: Personal & Account Identification */}
            <div>
              <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={16} /> 1. Personal & Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Primary Mobile Number *"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* SECTION 2: Business & Enterprise Details */}
            <div>
              <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 size={16} /> 2. Business & Enterprise Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="businessName"
                  placeholder="Business / Workshop Name *"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Private Limited">Private Limited</option>
                  <option value="Individual Fabricator">Individual Fabricator</option>
                </select>
                <input
                  type="text"
                  name="experienceYears"
                  placeholder="Years in Business (e.g. 5 Years)"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* SECTION 3: Precise Location for Customer Mapping */}
            <div>
              <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin size={16} /> 3. Workshop Location & Service Area Mapping
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea
                    name="address"
                    placeholder="Complete Shop / Workshop Address *"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    name="landmark"
                    placeholder="Nearby Landmark (e.g. Near Petrol Pump)"
                    value={formData.landmark}
                    onChange={handleChange}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    name="area"
                    placeholder="Area / Locality * (e.g. Civil Lines)"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City * (e.g. Bareilly)"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State *"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode * (e.g. 243001)"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength="6"
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Pricing & Services for Customer Dashboard */}
            <div>
              <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Briefcase size={16} /> 4. Pricing & Services Catalog
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="pricingDetails"
                  placeholder="Pricing Highlight * (e.g. Rolling Shutters @ ₹250/sq ft)"
                  value={formData.pricingDetails}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  name="servicesOffered"
                  placeholder="Services (e.g. Installation, Motor Repair, Sheds)"
                  value={formData.servicesOffered}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* SECTION 5: Legal & Tax Compliance */}
            <div>
              <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText size={16} /> 5. Legal, Tax & ID Compliance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="gstin"
                  placeholder="GSTIN Number (Optional)"
                  value={formData.gstin}
                  onChange={handleChange}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 uppercase"
                />
                <input
                  type="text"
                  name="pan"
                  placeholder="PAN Card Number *"
                  value={formData.pan}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 uppercase"
                />
                <input
                  type="text"
                  name="udyamNumber"
                  placeholder="Udyam Registration Number"
                  value={formData.udyamNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* SECTION 6: Bank Account Details for Payouts */}
            <div>
              <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Landmark size={16} /> 6. Bank Account Details (For Customer Leads & Payouts)
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="bankName"
                    placeholder="Bank Name (e.g. State Bank of India) *"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    name="accountHolderName"
                    placeholder="Account Holder Name *"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="accountNumber"
                    placeholder="Account Number *"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <input
                    type="text"
                    name="confirmAccountNumber"
                    placeholder="Confirm Account Number *"
                    value={formData.confirmAccountNumber}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <input
                    type="text"
                    name="ifsc"
                    placeholder="IFSC Code * (e.g. SBIN0001234)"
                    value={formData.ifsc}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 uppercase font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 7: Passwords & Security */}
            <div>
              <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck size={16} /> 7. Security Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password *"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-11 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password *"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-11 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={isCorporate}
                onChange={(e) => setIsCorporate(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-slate-300">Register as Corporate Supplier / Large Manufacturer?</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 py-4 rounded-xl font-bold uppercase tracking-wider hover:from-amber-400 hover:to-amber-300 transition shadow-xl mt-6"
            >
              {loading ? 'Submitting Registration...' : 'Complete Registration & Send OTP'}
            </button>

            <p className="text-center text-sm text-slate-400 pt-4">
              Already have an account?{' '}
              <button type="button" onClick={() => goTo('login')} className="text-amber-500 font-semibold hover:underline">
                Login Now
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export function LoginPage({ onNavigate }) { return <AuthCard mode="login" onNavigate={onNavigate} />; }
export function SignupPage({ onNavigate }) { return <AuthCard mode="signup" onNavigate={onNavigate} />; }
export function VerifyOtp({ onNavigate }) { return <AuthCard mode="verify-otp" onNavigate={onNavigate} />; }

export default AuthCard;