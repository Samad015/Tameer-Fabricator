import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Mail, Lock, User, Building2, MapPin, Phone, 
  FileText, Eye, EyeOff, Search, Loader2, IndianRupee,
  CheckCircle, CreditCard, Sparkles, ArrowRight
} from 'lucide-react';

// ==========================================
// GLOBAL API BASE URL (single source of truth)
// Set VITE_API_BASE_URL in your frontend .env file:
//   Local dev:  VITE_API_BASE_URL=http://localhost:5001
//   Production: VITE_API_BASE_URL=https://tameer-fabricator-backend.onrender.com
// Falls back to Render URL if the env var is missing.
// ==========================================
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://tameer-fabricator.onrender.com';

// ==========================================
// 1. LOGIN COMPONENT
// ==========================================
export function LoginPage() {
  const navigate = useNavigate();
  const { loginSession } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ emailOrPhone: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginValue = formData.emailOrPhone.trim();
      const phoneNumber = loginValue.replace(/[\s-]/g, '');
      const isPhone = /^[+]?[0-9]{10,13}$/.test(phoneNumber);

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isPhone
            ? { phone: phoneNumber, password: formData.password }
            : { email: loginValue, password: formData.password }
        )
      });

      const data = await response.json();

      if (data.success) {
        loginSession(data.token, data.user);
        
        if (!data.user.isSubscribed) {
          navigate('/complete-profile?step=subscribe');
        } else if (!data.user.isProfileComplete) {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert(data.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      console.error('Login Error:', err);
      alert('Network error while logging in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Dealer Portal Login</h2>
        <p className="text-center text-slate-400 text-sm mb-8">Access your workshop dashboard & customer leads</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              placeholder="Mobile Number or Email Address"
              value={formData.emailOrPhone}
              onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
              required
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-11 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase tracking-wider transition shadow-lg mt-2"
          >
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Logging In...</span> : 'Log In'}
          </button>

          <p className="text-center text-sm text-slate-400 pt-4">
            Don't have a dealer account?{' '}
            <button type="button" onClick={() => navigate('/register')} className="text-amber-500 font-semibold hover:underline">
              Register Workshop
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 2. SIGNUP COMPONENT
// ==========================================
export function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.companyName,
          password: formData.password,
          role: 'dealer'
        })
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('verifyEmail', formData.email);
        alert('Registration successful! OTP sent to your email.');
        navigate('/verify-otp');
      } else {
        alert(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Register Error:', err);
      alert('Error connecting to backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Register Workshop</h2>
        <p className="text-center text-slate-400 text-sm mb-6">Join Tameer Fabricators Network to grow your business</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="relative">
            <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              placeholder="Workshop / Business Name *"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                placeholder="Mobile Number *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password *"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password *"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase tracking-wider hover:from-amber-400 transition shadow-lg mt-4"
          >
            {loading ? 'Sending OTP...' : 'Register & Verify Email'}
          </button>

          <p className="text-center text-sm text-slate-400 pt-2">
            Already registered?{' '}
            <button type="button" onClick={() => navigate('/login')} className="text-amber-500 font-semibold hover:underline">
              Log In Here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. VERIFY OTP COMPONENT
// ==========================================
export function VerifyOtp() {
  const navigate = useNavigate();
  const { loginSession } = useContext(AuthContext);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const targetEmail = sessionStorage.getItem('verifyEmail');

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, otp })
      });

      const data = await response.json();

      if (data.success) {
        loginSession(data.token, data.user);
        sessionStorage.removeItem('verifyEmail');
        alert('Email verified successfully!');
        navigate('/complete-profile');
      } else {
        alert(data.message || 'Invalid OTP code.');
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      alert('Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Verify Email</h2>
        <p className="text-center text-slate-400 text-sm mb-6">
          Enter 6-digit verification code sent to <br />
          <span className="text-amber-400 font-semibold">{targetEmail || 'your email'}</span>
        </p>

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <input
            type="text"
            placeholder="0 0 0 0 0 0"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-4 text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-amber-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase tracking-wider transition shadow-lg"
          >
            {loading ? 'Verifying...' : 'Verify OTP & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 4. COMPLETE PROFILE PAGE
// ==========================================
export function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, fetchUserSession } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  const [formData, setFormData] = useState({
    businessType: 'Proprietorship',
    experienceYears: '',
    address: '',
    area: '',
    city: '',
    state: 'Uttar Pradesh',
    pincode: '',
    perKgPrice: '',
    pricingDetails: '',
    servicesOffered: 'Rolling Shutter Fabrication, Repair & Maintenance',
    gstin: '',
    pan: ''
  });

  useEffect(() => {
    if (addressQuery.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&countrycodes=in&addressdetails=1&limit=5`
        );
        const data = await response.json();
        setAddressSuggestions(data);
      } catch (err) {
        console.error('Address suggestion error:', err);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [addressQuery]);

  const handleSelectAddress = (item) => {
    const addr = item.address || {};
    const cityVal = addr.city || addr.town || addr.village || addr.state_district || '';
    const areaVal = addr.suburb || addr.neighbourhood || addr.road || addr.residential || cityVal;

    setFormData((prev) => ({
      ...prev,
      address: item.display_name,
      area: areaVal,
      city: cityVal,
      state: addr.state || 'Uttar Pradesh',
      pincode: addr.postcode || ''
    }));

    setAddressQuery(item.display_name);
    setAddressSuggestions([]);
  };

  const handleActivateSubscription = async () => {
    setSubscribing(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE}/api/auth/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        alert('₹999/month Subscription Activated Successfully!');
        await fetchUserSession();
      } else {
        alert(data.message || 'Subscription failed.');
      }
    } catch (err) {
      console.error('Subscription Error:', err);
      alert('Failed to process subscription.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();

    if (!formData.city || !formData.pincode || !formData.perKgPrice) {
      alert('Please fill out Location details and Per KG Shutter Price!');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    const payload = {
      ...formData,
      pricingHighlight: formData.pricingDetails,
      services: formData.servicesOffered
    };

    try {
      const response = await fetch(`${API_BASE}/api/auth/complete-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert('Workshop profile completed and published!');
        await fetchUserSession();
        navigate('/dashboard');
      } else {
        alert(data.message || 'Failed to complete profile.');
      }
    } catch (err) {
      console.error('Profile completion error:', err);
      alert('Server error while saving workshop profile.');
    } finally {
      setLoading(false);
    }
  };

  if (user && !user.isSubscribed) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-bold text-xs uppercase px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Sparkles size={14} /> Partner Tier
          </div>

          <div className="inline-flex p-4 bg-amber-500/10 rounded-full text-amber-500 mb-4 mt-2">
            <CreditCard size={40} />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Activate Partner Subscription</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Get listed on local customer shutter quote searches and directly receive verified customer inquiries.
          </p>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 mb-8 text-left space-y-3">
            <div className="flex items-center gap-3 text-slate-200 text-sm">
              <CheckCircle className="text-amber-500 shrink-0" size={18} />
              <span>Priority Listing in Customer Location Searches</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200 text-sm">
              <CheckCircle className="text-amber-500 shrink-0" size={18} />
              <span>Direct Commercial Shutter Quote Inquiries</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200 text-sm">
              <CheckCircle className="text-amber-500 shrink-0" size={18} />
              <span>Public Dealer Profile Showcase & Verified Badge</span>
            </div>

            <div className="border-t border-slate-700 pt-4 mt-4 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Monthly Partner Plan</span>
                <span className="text-2xl font-bold text-amber-400 flex items-center">
                  ₹999 <span className="text-xs text-slate-400 font-normal ml-1">/ month</span>
                </span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Cancel Anytime
              </span>
            </div>
          </div>

          <button
            onClick={handleActivateSubscription}
            disabled={subscribing}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold py-4 rounded-xl text-lg hover:from-amber-400 hover:to-amber-300 transition shadow-xl flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            {subscribing ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> Subscribe Now (₹999/mo) <ArrowRight size={20} /></>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Complete Workshop Profile</h2>
        <p className="text-center text-slate-400 text-sm mb-8">
          Add your rates & location details so local customers can view your profile and contact you.
        </p>

        <form onSubmit={handleSubmitProfile} className="space-y-6">
          <div>
            <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building2 size={16} /> Workshop Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Proprietorship">Proprietorship Workshop</option>
                <option value="Partnership">Partnership</option>
                <option value="Private Limited">Private Limited</option>
                <option value="Individual Fabricator">Individual Fabricator</option>
              </select>

              <input
                type="text"
                placeholder="Years in Business (e.g., 8 Years)"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={16} /> Workshop Location (Search & Select)
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="text"
                  placeholder="Type shop address / area / city to search *"
                  value={addressQuery}
                  onChange={(e) => {
                    setAddressQuery(e.target.value);
                    setFormData({ ...formData, address: e.target.value });
                  }}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-10 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
                {isSearchingAddress && <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-amber-500" />}

                {addressSuggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {addressSuggestions.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectAddress(item)}
                        className="px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 hover:text-amber-400 cursor-pointer border-b border-slate-700/50 last:border-none flex items-start gap-2"
                      >
                        <MapPin size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item.display_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Area / Locality *"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="City *"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Pincode *"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  maxLength="6"
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <IndianRupee size={16} /> Rates & Offerings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="number"
                  placeholder="Per KG Price (₹) *"
                  value={formData.perKgPrice}
                  onChange={(e) => setFormData({ ...formData, perKgPrice: e.target.value })}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <input
                type="text"
                placeholder="Pricing Highlight (e.g. @ ₹250/sq ft)"
                value={formData.pricingDetails}
                onChange={(e) => setFormData({ ...formData, pricingDetails: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Services Offered"
                value={formData.servicesOffered}
                onChange={(e) => setFormData({ ...formData, servicesOffered: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText size={16} /> Tax & Compliance Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="GSTIN Number (Optional)"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm uppercase focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="PAN Number (Optional)"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm uppercase focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold py-4 rounded-xl text-lg hover:from-amber-400 transition shadow-xl uppercase tracking-wider"
          >
            {loading ? 'Publishing Profile...' : 'Complete & Publish Workshop Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AuthCard({ mode = 'login' }) {
  if (mode === 'signup') return <SignupPage />;
  if (mode === 'verify-otp') return <VerifyOtp />;
  return <LoginPage />;
}

export default AuthCard;