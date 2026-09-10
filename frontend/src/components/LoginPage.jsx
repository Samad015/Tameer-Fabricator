import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '', // holds email OR mobile number
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Email OR Mobile Number Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginValue = formData.email.trim();

      // Remove spaces and hyphens from mobile number
      const phoneNumber = loginValue.replace(/[\s-]/g, '');

      // Check whether entered value is a phone number
      const isPhone = /^[+]?[0-9]{10,13}$/.test(phoneNumber);

      const response = await fetch('/api/auth/login', {
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

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden py-10 transition-colors duration-300">
      <div className="relative w-full max-w-md bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">Dealer Login</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
          Login using your registered mobile number or email address.
        </p>

        <form onSubmit={handleLogin}>
          <div className="relative mb-4">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              name="email"
              placeholder="Mobile number or email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-slate-100 border border-slate-300 dark:bg-slate-800/60 dark:border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
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
              className="w-full bg-slate-100 border border-slate-300 dark:bg-slate-800/60 dark:border-slate-700 rounded-lg pl-11 pr-11 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase transition mt-4 mb-6"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-amber-500 font-semibold hover:underline"
            >
              Register Now
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
