import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const phone = sessionStorage.getItem('verifyPhone') || '';

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });

      const data = await response.json();

      if (data.success) {
        alert('Mobile number verified successfully!');
        sessionStorage.removeItem('verifyPhone');
        // Yaha se aage onboarding form / login par bhej sakte hain — baad me decide karenge
        navigate('/login');
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
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden py-10 transition-colors duration-300">
      <div className="relative w-full max-w-md bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">Verify OTP</h2>

        <form onSubmit={handleVerifyOtp}>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 text-center">
            Please enter the 6-digit OTP sent to{' '}
            <span className="text-amber-600 dark:text-amber-400">{phone}</span>
          </p>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              className="w-full bg-slate-100 border border-slate-300 dark:bg-slate-800/60 dark:border-slate-700 rounded-lg px-4 py-3.5 text-slate-900 dark:text-white text-center text-lg tracking-widest focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-lg font-bold uppercase transition mb-6"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
