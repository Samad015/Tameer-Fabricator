import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Building2, MapPin, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';

// 1. Login Component
export const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      alert('Login successful!');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1">Login to Tameer Fabricator's Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/50 border border-red-500 text-red-200 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Email Address *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Mail size={18} /></span>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="name@gmail.com" className="w-full pl-10 pr-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Password *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Lock size={18} /></span>
              <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl transition duration-200 shadow-lg text-sm tracking-wide disabled:opacity-50">
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Don't have an account? <Link to="/register" className="text-amber-400 hover:underline font-medium">Register Now</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Register Component (with optional fields)
export const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    isCorporate: false,
    gstin: '',
    pan: '',
    udyamNumber: '',
    aadhaarNumber: '',
    accountNumber: '',
    ifsc: '',
    accountHolderName: '',
    bankName: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.companyName || !formData.address || !formData.phone || !formData.email || !formData.password) {
      setError('Please fill in all mandatory fields (*).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      alert('Registration successful! Please verify OTP.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-gray-400 text-sm mt-1">Join Tameer Fabricator's Business Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/50 border border-red-500 text-red-200 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3 pb-1 border-b border-gray-800">
              Primary Details (Mandatory *)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Full Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><User size={18} /></span>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Enter your full name" className="w-full pl-10 pr-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Company Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Building2 size={18} /></span>
                  <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} placeholder="Tameer Fabricators" className="w-full pl-10 pr-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Business Address *</label>
                <div className="relative">
                  <span className="absolute top-3 left-3 text-gray-400"><MapPin size={18} /></span>
                  <textarea name="address" required rows="2" value={formData.address} onChange={handleChange} placeholder="Enter complete address" className="w-full pl-10 pr-4 py-2 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm resize-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Phone Number *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Phone size={18} /></span>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="9876543210" className="w-full pl-10 pr-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Email Address (Gmail) *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Mail size={18} /></span>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="name@gmail.com" className="w-full pl-10 pr-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Password *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Lock size={18} /></span>
                    <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Confirm Password *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Lock size={18} /></span>
                    <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3 pb-1 border-b border-gray-800">
              Business Details (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">GSTIN</label>
                <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} placeholder="GSTIN Number" className="w-full px-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">PAN</label>
                <input type="text" name="pan" value={formData.pan} onChange={handleChange} placeholder="PAN Number" className="w-full px-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Udyam Number</label>
                <input type="text" name="udyamNumber" value={formData.udyamNumber} onChange={handleChange} placeholder="Udyam Number" className="w-full px-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">ID Number</label>
                <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} placeholder="ID Number" className="w-full px-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3 pb-1 border-b border-gray-800">
              Bank Details (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Account Number</label>
                <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Account Number" className="w-full px-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">IFSC Code</label>
                <input type="text" name="ifsc" value={formData.ifsc} onChange={handleChange} placeholder="IFSC Code" className="w-full px-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Account Holder Name</label>
                <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} placeholder="Holder Name" className="w-full px-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Bank Name</label>
                <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Bank Name" className="w-full px-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input type="checkbox" name="isCorporate" id="isCorporate" checked={formData.isCorporate} onChange={handleChange} className="w-4 h-4 text-amber-500 bg-gray-700 border-gray-600 rounded focus:ring-amber-500" />
            <label htmlFor="isCorporate" className="ml-2 text-sm text-gray-300">Register as Corporate Client?</label>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl transition duration-200 shadow-lg text-sm tracking-wide disabled:opacity-50">
            {loading ? 'Processing...' : 'REGISTER & SEND OTP'}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Already have an account? <Link to="/login" className="text-amber-400 hover:underline font-medium">Login Now</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      alert('Account verified successfully! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Verify OTP</h2>
          <p className="text-gray-400 text-sm mt-1">Enter the OTP sent to <span className="text-amber-400">{email || 'your email'}</span></p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/50 border border-red-500 text-red-200 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Enter OTP *</label>
            <input 
              type="text" 
              maxLength="6" 
              required 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="123456" 
              className="w-full px-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-xl text-white tracking-widest text-center text-lg placeholder-gray-500 focus:outline-none focus:border-amber-500" 
            />
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl transition duration-200 shadow-lg text-sm tracking-wide disabled:opacity-50">
            {loading ? 'Verifying...' : 'VERIFY OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export { Register as SignupPage };