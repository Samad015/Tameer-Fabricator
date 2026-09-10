import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError('');
  };

  const handleGetOtp = async (e) => {
    e.preventDefault();

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('verifyEmail', email);
        navigate('/verify-otp');
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Send OTP Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden py-10 transition-colors duration-300">

      <div className="relative w-full max-w-md bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl shadow-2xl p-8">

        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">
          Dealer Registration
        </h2>

        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
          Enter your email address to get started.
        </p>

        <form onSubmit={handleGetOtp}>

          <div className="relative mb-2">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
            />

            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full bg-slate-100 border border-slate-300 dark:bg-slate-800/60 dark:border-slate-700 rounded-lg pl-11 pr-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {error && (
            <p className="text-red-500 dark:text-red-400 text-xs mb-3 px-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 py-3.5 rounded-lg font-bold uppercase transition mt-4 mb-6"
          >
            {loading ? 'Sending OTP...' : 'Get OTP'}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-amber-500 font-semibold hover:underline"
            >
              Login Now
            </button>
          </p>

        </form>
      </div>
    </div>
  );
}