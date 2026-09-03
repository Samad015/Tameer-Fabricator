import React, { useState } from 'react'; 
import { Mail, Lock, User, Building2, Eye, EyeOff } from 'lucide-react'; 
 
function AuthCard({ mode = 'login', onNavigate }) { 
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirm, setShowConfirm] = useState(false); 
  const [isCorporate, setIsCorporate] = useState(false); 

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [otp, setOtp] = useState('');
  
  // Flow states for Signup (Step 1: Register & Send OTP -> Step 2: Verify OTP)
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isLogin = mode === 'login'; 
 
  const goTo = (next) => { 
    if (onNavigate) onNavigate(next); 
  }; 

  // --- HANDLE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      console.log('Login Response:', data);

      if (data.success) {
        alert('Login Successful!');
        // Token ko localStorage me save kar sakte hain
        localStorage.setItem('token', data.token);
        goTo('home'); // ya jo bhi home route ho
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

  // --- HANDLE REGISTER (Step 1) ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, companyName, isCorporate })
      });
      const data = await response.json();
      console.log('Register Response:', data);

      if (data.success) {
        alert('Registration successful! OTP sent to your email.');
        setStep(2); // Move to OTP verification step
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

  // --- HANDLE VERIFY OTP (Step 2) ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();
      console.log('Verify OTP Response:', data);

      if (data.success) {
        alert('Email verified successfully! You can now log in.');
        goTo('login');
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
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"> 
        <div className="absolute top-0 left-1/4 w-px h-full bg-amber-500" /> 
        <div className="absolute top-0 left-2/4 w-px h-full bg-amber-500" /> 
        <div className="absolute top-0 left-3/4 w-px h-full bg-amber-500" /> 
      </div> 
 
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8"> 
        <h2 className="text-3xl font-bold text-white text-center mb-8"> 
          {isLogin ? 'Login' : step === 1 ? 'Create Account' : 'Verify OTP'} 
        </h2> 
 
        {isLogin ? ( 
          <form onSubmit={handleLogin}> 
            {/* Email */} 
            <div className="relative mb-4"> 
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" /> 
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 transition" 
              /> 
            </div> 
 
            {/* Password */} 
            <div className="relative mb-3"> 
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" /> 
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
        ) : ( 
          // SIGNUP / OTP FLOW
          <>
            {step === 1 ? (
              <form onSubmit={handleRegister}> 
                {/* Full Name */} 
                <div className="relative mb-4"> 
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" /> 
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 transition" 
                  /> 
                </div> 
 
                {/* Company Name */} 
                <div className="relative mb-4"> 
                  <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" /> 
                  <input 
                    type="text" 
                    placeholder="Business Name (Optional)" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 transition" 
                  /> 
                </div> 
 
                {/* Email */} 
                <div className="relative mb-4"> 
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" /> 
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 transition" 
                  /> 
                </div> 
 
                {/* Password */} 
                <div className="relative mb-4"> 
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" /> 
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
 
                {/* Confirm Password */} 
                <div className="relative mb-4"> 
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" /> 
                  <input 
                    type={showConfirm ? 'text' : 'password'} 
                    placeholder="Confirm Password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-11 py-3.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 transition" 
                  /> 
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" 
                  > 
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />} 
                  </button> 
                </div> 
 
                {/* Corporate checkbox */} 
                <label className="flex items-center gap-2 mb-6 cursor-pointer"> 
                  <input 
                    type="checkbox" 
                    checked={isCorporate} 
                    onChange={(e) => setIsCorporate(e.target.checked)} 
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500" 
                  /> 
                  <span className="text-sm text-slate-300"> 
                    Register as Corporate Client? 
                  </span> 
                </label> 
 
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase tracking-wide hover:from-amber-400 hover:to-amber-300 transition mb-6" 
                > 
                  {loading ? 'Processing...' : 'Register & Send OTP'} 
                </button> 
 
                <p className="text-center text-sm text-slate-400"> 
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
            ) : (
              /* STEP 2: OTP VERIFICATION FORM */
              <form onSubmit={handleVerifyOtp}>
                <p className="text-sm text-slate-300 mb-4 text-center">
                  Please enter the 6-digit OTP sent to <span className="text-amber-400">{email}</span>
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
              </form>
            )}
          </>
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
 
export default AuthCard;