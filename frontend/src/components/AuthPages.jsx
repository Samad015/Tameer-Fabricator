import React, { useState } from 'react';
import { Mail, Lock, User, Building2, MapPin, Phone, Eye, EyeOff } from 'lucide-react';

export function AuthCard({ mode = 'login', onNavigate }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCorporate, setIsCorporate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Current view ko manage karne ke liye local state
  const [currentMode, setCurrentMode] = useState(mode);
  const [step, setStep] = useState(mode === 'verify-otp' ? 2 : 1);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    address: '',
    phone: '',
    gstin: '',
    pan: '',
    udyamNumber: '',
    aadhaarNumber: '',
    accountNumber: '',
    ifsc: '',
    accountHolderName: '',
    bankName: ''
  });

  const isLogin = currentMode === 'login';
  const isVerifyOtpMode = currentMode === 'verify-otp';

  const goTo = (next) => {
    setCurrentMode(next);
    if (onNavigate) onNavigate(next);
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
        goTo('home');
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
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyName: formData.businessName,
          isCorporate
        })
      });
      const data = await response.json();

      if (data.success) {
        alert('Registration successful! OTP sent to your email.');
        setCurrentMode('verify-otp');
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

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      const data = await response.json();

      if (data.success) {
        alert('Email verified successfully! Please log in.');
        // OTP verify hote hi automatically login form khul jayega
        setCurrentMode('login');
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
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className={`relative w-full ${isLogin || isVerifyOtpMode || step === 2 ? 'max-w-md' : 'max-w-2xl'} bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8`}>
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          {isLogin ? 'Login' : (isVerifyOtpMode || step === 2) ? 'Verify OTP' : 'Create Account'}
        </h2>

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
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 transition"
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
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-11 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right mb-6">
              <a href="#" className="text-sm text-slate-400 hover:text-amber-500 transition">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase tracking-wide hover:from-amber-400 hover:to-amber-300 transition mb-6"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <p className="text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => goTo('signup')}
                className="text-amber-500 font-semibold hover:underline"
              >
                Register Now
              </button>
            </p>
          </form>
        ) : isVerifyOtpMode || step === 2 ? (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-sm text-slate-300 mb-4 text-center">
              Please enter the 6-digit OTP sent to <span className="text-amber-400">{formData.email || 'your email'}</span>
            </p>
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3.5 text-white placeholder-slate-400 text-sm tracking-widest text-center focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase tracking-wide hover:from-amber-400 hover:to-amber-300 transition mb-6"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => goTo('login')}
                className="text-sm text-slate-400 hover:text-amber-500 transition"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="relative">
                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="text"
                  name="businessName"
                  placeholder="Business Name *"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-4 text-amber-500" />
              <textarea
                name="address"
                placeholder="Full Address *"
                value={formData.address}
                onChange={handleChange}
                required
                rows={2}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="gstin"
                placeholder="GSTIN (Optional)"
                value={formData.gstin}
                onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                name="pan"
                placeholder="PAN Number"
                value={formData.pan}
                onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                name="udyamNumber"
                placeholder="Udyam Number"
                value={formData.udyamNumber}
                onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="aadhaarNumber"
                placeholder="Aadhaar / ID Number"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                name="bankName"
                placeholder="Bank Name"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="accountNumber"
                placeholder="Account Number"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                name="ifsc"
                placeholder="IFSC Code"
                value={formData.ifsc}
                onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                name="accountHolderName"
                placeholder="Account Holder Name"
                value={formData.accountHolderName}
                onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

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
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-11 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
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
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-11 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={isCorporate}
                onChange={(e) => setIsCorporate(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-slate-300">Register as Corporate Client?</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase tracking-wide hover:from-amber-400 hover:to-amber-300 transition mt-4"
            >
              {loading ? 'Processing...' : 'Register & Send OTP'}
            </button>

            <p className="text-center text-sm text-slate-400 pt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => goTo('login')}
                className="text-amber-500 font-semibold hover:underline"
              >
                Login Now
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export function LoginPage({ onNavigate }) {
  return <AuthCard mode="login" onNavigate={onNavigate} />;
}

export function SignupPage({ onNavigate }) {
  return <AuthCard mode="signup" onNavigate={onNavigate} />;
}

export function VerifyOtp({ onNavigate }) {
  return <AuthCard mode="verify-otp" onNavigate={onNavigate} />;
}

export default AuthCard;