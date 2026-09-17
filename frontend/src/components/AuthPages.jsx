import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Mail, Lock, User, Building2, MapPin, Phone, 
  Eye, EyeOff, Loader2, IndianRupee,
  CreditCard, Sparkles, ArrowRight, AlertCircle, Check, X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://tameer-fabricator-backend.onrender.com';

// ==========================================
// SHARED VALIDATION HELPERS
// ==========================================
const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'yopmail.com', 'guerrillamail.com', 'sharklasers.com',
  '10minutemail.com', 'tempmail.com', 'temp-mail.org', 'throwawaymail.com',
  'trashmail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc',
  'fakeinbox.com', 'mailnesia.com', 'moakt.com', 'mohmal.com', 'mailsac.com'
];

const validateEmailField = (value) => {
  const email = value.trim().toLowerCase();
  if (!email) return 'Email address is required.';

  const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!pattern.test(email)) return 'Please enter a valid email address.';

  const [localPart, domain] = email.split('@');
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return 'Please enter a valid email address.';
  }

  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return 'Temporary email addresses are not allowed. Please use a permanent email.';
  }

  return '';
};

const validatePhoneField = (value) => {
  let digits = value.replace(/\D/g, '');
  if (!digits) return 'Mobile number is required.';

  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);

  if (digits.length !== 10) return 'Mobile number must be exactly 10 digits.';
  if (!/^[6-9]\d{9}$/.test(digits)) return 'Must be a valid Indian number starting with 6, 7, 8 or 9.';
  if (/^(\d)\1{9}$/.test(digits)) return 'Please enter a real mobile number.';

  return '';
};

const validateNameField = (value, label) => {
  const name = value.trim();
  if (!name) return `${label} is required.`;
  if (name.length < 2) return `${label} must be at least 2 characters.`;
  if (!/^[a-zA-Z0-9\s.,'&()-]+$/.test(name)) return `${label} contains invalid characters.`;
  if (!/[a-zA-Z]/.test(name)) return `Please enter a valid ${label.toLowerCase()}.`;
  return '';
};

const getPasswordRules = (password) => ([
  { label: 'At least 8 characters', met: password.length >= 8 },
  { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
  { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
  { label: 'One number (0-9)', met: /\d/.test(password) },
  { label: 'One special character (@ # $ !)', met: /[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(password) },
]);

const validatePasswordField = (password) => {
  if (!password) return 'Password is required.';
  const unmet = getPasswordRules(password).filter((r) => !r.met);
  if (unmet.length > 0) return 'Password does not meet all requirements.';
  return '';
};

const FieldError = ({ message }) => {
  if (!message) return null;
  return (
    <p className="flex items-start gap-1.5 text-xs text-red-400 mt-1.5">
      <AlertCircle size={13} className="shrink-0 mt-0.5" />
      <span>{message}</span>
    </p>
  );
};

// ==========================================
// 1. LOGIN COMPONENT
// ==========================================
export function LoginPage() {
  const navigate = useNavigate();
  const { loginSession } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [formData, setFormData] = useState({ emailOrPhone: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerError('');
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
          navigate('/my-workshop');
        }
      } else {
        setServerError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Dealer Portal Login</h2>
        <p className="text-center text-slate-400 text-sm mb-8">Access your workshop dashboard & customer leads</p>

        {serverError && (
          <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              placeholder="Mobile Number or Email Address"
              value={formData.emailOrPhone}
              onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
              required
              autoComplete="username"
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
              autoComplete="current-password"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-11 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-amber-500 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase tracking-wider transition shadow-lg mt-2 disabled:opacity-60"
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
  const [serverError, setServerError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
    confirmPassword: ''
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const passwordRules = getPasswordRules(formData.password);

  const validateField = (field, value, allValues = formData) => {
    switch (field) {
      case 'name': return validateNameField(value, 'Full name');
      case 'companyName': return validateNameField(value, 'Workshop name');
      case 'email': return validateEmailField(value);
      case 'phone': return validatePhoneField(value);
      case 'password': return validatePasswordField(value);
      case 'confirmPassword':
        if (!value) return 'Please confirm your password.';
        if (value !== allValues.password) return 'Passwords do not match.';
        return '';
      default: return '';
    }
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value, updated) }));
    }

    if (field === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: updated.confirmPassword && updated.confirmPassword !== value ? 'Passwords do not match.' : ''
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  const validateAll = () => {
    const fields = ['name', 'companyName', 'email', 'phone', 'password', 'confirmPassword'];
    const newErrors = {};
    fields.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) newErrors[f] = err;
    });
    setErrors(newErrors);
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateAll()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.replace(/\D/g, ''),
          companyName: formData.companyName.trim(),
          password: formData.password,
          role: 'dealer'
        })
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('verifyEmail', data.email || formData.email.trim().toLowerCase());
        navigate('/verify-otp');
      } else {
        if (data.field) {
          setErrors((prev) => ({ ...prev, [data.field]: data.message }));
          setTouched((prev) => ({ ...prev, [data.field]: true }));
        } else {
          setServerError(data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Register Error:', err);
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-slate-800/60 border rounded-lg pl-11 pr-4 py-3 text-white text-sm focus:outline-none transition ${
      touched[field] && errors[field]
        ? 'border-red-500/60 focus:border-red-500'
        : 'border-slate-700 focus:border-amber-500'
    }`;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Register Workshop</h2>
        <p className="text-center text-slate-400 text-sm mb-6">Join Tameer Fabricators Network to grow your business</p>

        {serverError && (
          <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleRegister} noValidate className="space-y-4">
          <div>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                autoComplete="name"
                className={inputClass('name')}
              />
            </div>
            <FieldError message={touched.name ? errors.name : ''} />
          </div>

          <div>
            <div className="relative">
              <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                placeholder="Workshop / Business Name *"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                onBlur={() => handleBlur('companyName')}
                autoComplete="organization"
                className={inputClass('companyName')}
              />
            </div>
            <FieldError message={touched.companyName ? errors.companyName : ''} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  autoComplete="email"
                  className={inputClass('email')}
                />
              </div>
              <FieldError message={touched.email ? errors.email : ''} />
            </div>

            <div>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={13}
                  placeholder="Mobile Number *"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  autoComplete="tel"
                  className={inputClass('phone')}
                />
              </div>
              <FieldError message={touched.phone ? errors.phone : ''} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password *"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => { setPasswordFocused(false); handleBlur('password'); }}
                  autoComplete="new-password"
                  className={`${inputClass('password')} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  autoComplete="new-password"
                  className={inputClass('confirmPassword')}
                />
              </div>
              <FieldError message={touched.confirmPassword ? errors.confirmPassword : ''} />
            </div>
          </div>

          {(passwordFocused || formData.password) && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                Password Requirements
              </p>
              {passwordRules.map((rule) => (
                <div key={rule.label} className="flex items-center gap-2 text-xs">
                  {rule.met ? (
                    <Check size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <X size={14} className="text-slate-600 shrink-0" />
                  )}
                  <span className={rule.met ? 'text-emerald-400' : 'text-slate-500'}>{rule.label}</span>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase tracking-wider hover:from-amber-400 transition shadow-lg mt-4 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} /> Sending OTP...
              </span>
            ) : 'Register & Verify Email'}
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
  const [serverError, setServerError] = useState('');
  const targetEmail = sessionStorage.getItem('verifyEmail');

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!/^\d{6}$/.test(otp.trim())) {
      setServerError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, otp: otp.trim() })
      });

      const data = await response.json();

      if (data.success) {
        loginSession(data.token, data.user);
        sessionStorage.removeItem('verifyEmail');
        navigate('/complete-profile');
      } else {
        setServerError(data.message || 'Invalid OTP code.');
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      setServerError('Network error. Please try again.');
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

        {serverError && (
          <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <input
            type="text"
            inputMode="numeric"
            placeholder="0 0 0 0 0 0"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            autoComplete="one-time-code"
            required
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-4 text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-amber-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase tracking-wider transition shadow-lg disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} /> Verifying...
              </span>
            ) : 'Verify OTP & Continue'}
          </button>

          <p className="text-center text-xs text-slate-500">
            Didn't receive it? Check your spam folder, or{' '}
            <button type="button" onClick={() => navigate('/register')} className="text-amber-500 font-semibold hover:underline">
              register again
            </button>{' '}
            to resend.
          </p>
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
  const [serverError, setServerError] = useState('');

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
    setServerError('');
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
        await fetchUserSession();
      } else {
        setServerError(data.message || 'Subscription failed.');
      }
    } catch (err) {
      console.error('Subscription Error:', err);
      setServerError('Failed to process subscription. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!formData.city || !formData.pincode || !formData.perKgPrice) {
      setServerError('Please fill out location details and per-kg shutter price.');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setServerError('Pincode must be exactly 6 digits.');
      return;
    }

    const priceValue = Number(formData.perKgPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      setServerError('Please enter a valid per-kg price.');
      return;
    }

    if (formData.gstin.trim() && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(formData.gstin.trim().toUpperCase())) {
      setServerError('Please enter a valid 15-character GSTIN, or leave it blank.');
      return;
    }

    if (formData.pan.trim() && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(formData.pan.trim().toUpperCase())) {
      setServerError('Please enter a valid 10-character PAN, or leave it blank.');
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
        await fetchUserSession();
        navigate('/my-workshop');
      } else {
        setServerError(data.message || 'Failed to complete profile.');
      }
    } catch (err) {
      console.error('Profile completion error:', err);
      setServerError('Server error while saving workshop profile.');
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
            Unlock direct customer quote requests, lead management tools, and priority listing across your operational territory.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 mb-6 text-left space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Annual Workshop Membership</span>
              <span className="text-white font-bold flex items-center"><IndianRupee size={15} /> 2,999 / year</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-3">
              <span className="text-slate-400">Lead Commission Fee</span>
              <span className="text-emerald-400 font-semibold">0% Commission</span>
            </div>
          </div>

          {serverError && (
            <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl text-left">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <button
            onClick={handleActivateSubscription}
            disabled={subscribing}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-4 rounded-xl font-bold uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {subscribing ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Processing Payment...
              </>
            ) : (
              <>
                Pay ₹2,999 & Activate Partner Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 p-4 py-12">
      <div className="w-full max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Complete Workshop Profile</h2>
        <p className="text-center text-slate-400 text-sm mb-8">Provide your manufacturing details so customers can request precise shutter quotes</p>

        {serverError && (
          <div className="mb-6 flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Business Type</label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3.5 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Proprietorship">Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Private Limited">Private Limited</option>
                <option value="Independent Fabricator">Independent Fabricator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                placeholder="e.g. 8"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Workshop Address & Location Lookup</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                placeholder="Start typing your shop address or area..."
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-10 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
              />
              {isSearchingAddress && (
                <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 animate-spin" />
              )}
            </div>

            {addressSuggestions.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {addressSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAddress(item)}
                    className="w-full text-left px-4 py-3 text-xs text-slate-200 hover:bg-slate-700 border-b border-slate-700/50 last:border-0 flex items-start gap-2"
                  >
                    <MapPin size={14} className="shrink-0 mt-0.5 text-amber-400" />
                    <span>{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">City / Town *</label>
              <input
                type="text"
                placeholder="e.g. Bareilly"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Pincode *</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="243001"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Base Shutter Price (₹ per KG) *</label>
              <div className="relative">
                <IndianRupee size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="number"
                  placeholder="e.g. 110"
                  value={formData.perKgPrice}
                  onChange={(e) => setFormData({ ...formData, perKgPrice: e.target.value })}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Pricing Highlight / Note</label>
              <input
                type="text"
                placeholder="e.g. Includes powder coating & heavy spring"
                value={formData.pricingDetails}
                onChange={(e) => setFormData({ ...formData, pricingDetails: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Services Offered</label>
            <input
              type="text"
              value={formData.servicesOffered}
              onChange={(e) => setFormData({ ...formData, servicesOffered: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3.5 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">GSTIN Number (Optional)</label>
              <input
                type="text"
                maxLength={15}
                placeholder="09AAAAA0000A1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3.5 text-white placeholder-slate-500 text-sm uppercase focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">PAN Number (Optional)</label>
              <input
                type="text"
                maxLength={10}
                placeholder="AAAAA0000A"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3.5 text-white placeholder-slate-500 text-sm uppercase focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-4 rounded-xl font-bold uppercase tracking-wider transition shadow-lg mt-6 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Saving Profile...
              </>
            ) : (
              <>
                Save Profile & Open Workshop Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
// ==========================================
// 5. FORGOT PASSWORD COMPONENT (UPDATED WITH OTP & NEW PASSWORD)
// ==========================================
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Verify OTP & Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');

  // Step 1: Request OTP handler
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setServerError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await response.json();

      if (data.success) {
        setMessage('OTP has been sent to your email.');
        setStep(2); // Move to OTP input step
      } else {
        setServerError(data.message || 'Failed to send reset email.');
      }
    } catch (err) {
      console.error('Forgot Password Error:', err);
      setServerError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setServerError('');
    setMessage('');

    if (!/^\d{6}$/.test(otp.trim())) {
      setServerError('Please enter a valid 6-digit OTP.');
      return;
    }

    if (newPassword.length < 8) {
      setServerError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword: newPassword
        })
      });
      const data = await response.json();

      if (data.success) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setServerError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('Reset Password Error:', err);
      setServerError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Reset Password</h2>
        <p className="text-center text-slate-400 text-sm mb-6">
          {step === 1 ? 'Enter your registered email to receive OTP' : `Enter OTP sent to ${email}`}
        </p>

        {serverError && (
          <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {message && (
          <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-4 py-3 rounded-xl">
            {message}
          </div>
        )}

        {step === 1 ? (
          // STEP 1 FORM: Request Email OTP
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase tracking-wider transition shadow-lg disabled:opacity-60"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          // STEP 2 FORM: Enter OTP & New Password
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">6-Digit OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-center text-xl font-mono tracking-[0.3em] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase tracking-wider transition shadow-lg disabled:opacity-60 mt-2"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-slate-400 hover:text-amber-500 pt-2"
            >
              ← Back to enter different email
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-400 pt-6 border-t border-slate-800 mt-6">
          Remembered password?{' '}
          <button type="button" onClick={() => navigate('/login')} className="text-amber-500 font-semibold hover:underline">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}