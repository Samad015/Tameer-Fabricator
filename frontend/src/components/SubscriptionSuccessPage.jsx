import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, IndianRupee, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const userEmail = sessionStorage.getItem('verifyEmail') || localStorage.getItem('userEmail');
  const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async () => {
    setLoading(true);
    const res = await loadRazorpayScript();

    if (!res) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on backend
      const orderRes = await fetch('/api/payment/create-subscription-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert('Could not initiate subscription order.');
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout Window
      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Tameer Fabricators',
        description: 'Dealer Monthly Subscription (₹999/month)',
        order_id: orderData.order.id,
        handler: async function (response) {
          // 3. Verify payment on backend
          const verifyRes = await fetch('/api/payment/verify-subscription-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: userId
            })
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert('Subscription activated successfully! Welcome to your Dashboard.');
            localStorage.setItem('token', verifyData.token || localStorage.getItem('token'));
            navigate('/dashboard');
          } else {
            alert(verifyData.message || 'Payment verification failed.');
          }
        },
        prefill: {
          email: userEmail
        },
        theme: {
          color: '#f59e0b'
        }
      };

      const paymentWindow = new window.Razorpay(options);
      paymentWindow.open();
    } catch (err) {
      console.error('Subscription Error:', err);
      alert('Something went wrong during subscription payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
          <CheckCircle2 size={36} />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">You Have Successfully Registered!</h2>
        <p className="text-slate-400 text-sm mb-6">
          Your account is verified. To start receiving local customer leads and showcase your workshop on the public directory, activate your monthly subscription plan.
        </p>

        {/* Pricing Card Box */}
        <div className="bg-slate-800/60 border border-amber-500/30 rounded-xl p-5 mb-6 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-lg">
            Essential Plan
          </div>
          <h3 className="text-white font-semibold text-base mb-1">Dealer Pro Access</h3>
          <p className="text-slate-400 text-xs mb-3">Unlimited customer leads, custom pricing quote calculator, and priority listing.</p>
          <div className="flex items-baseline gap-1 text-amber-400 font-bold text-2xl">
            <IndianRupee size={22} className="inline" />
            <span>999</span>
            <span className="text-slate-400 text-xs font-normal">/ month</span>
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-xl font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 mb-3 shadow-lg"
        >
          {loading ? 'Processing...' : 'Subscribe Now (₹999)'} <ArrowRight size={18} />
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs text-slate-500 hover:text-slate-300 underline transition"
        >
          Skip for now (Go to Dashboard)
        </button>
      </div>
    </div>
  );
}