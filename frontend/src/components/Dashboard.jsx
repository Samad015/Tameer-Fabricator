import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, CheckCircle2, Edit3, ShieldCheck, FileText, Share2, BarChart3, ExternalLink } from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('primary');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          if (onNavigate) onNavigate('login');
          return;
        }

        const response = await fetch('http://localhost:5001/api/auth/get-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
        } else {
          alert('Session expired. Please login again.');
          localStorage.removeItem('token');
          if (onNavigate) onNavigate('login');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [onNavigate]);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Dashboard...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">User profile not found. Please log in.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-wrap gap-2 items-center shadow-md">
          {[
            { id: 'primary', label: 'Primary Details' },
            { id: 'additional', label: 'Additional Details' },
            { id: 'trust', label: 'Trust Profile', badge: 'Verified' },
            { id: 'pages', label: 'Website Pages' },
            { id: 'catalog', label: 'Share Catalog' },
            { id: 'reports', label: 'Performance Reports' },
            { id: 'social', label: 'Social' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content Sections */}
        {activeTab === 'primary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Card: Personal & Company Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-xl space-y-6">
              <button className="absolute top-6 right-6 text-amber-500 hover:text-amber-400 flex items-center gap-1 text-sm font-semibold">
                <Edit3 size={16} /> Edit
              </button>

              <div>
                <h1 className="text-2xl font-bold tracking-wide uppercase text-white">{user.name}</h1>
                <p className="text-amber-400 font-medium text-sm mt-0.5">{user.isCorporate ? 'Corporate Director' : 'Managing Director'}</p>
                <div className="flex items-center gap-1.5 text-slate-300 text-sm mt-2 font-semibold hover:text-amber-400 cursor-pointer">
                  <Building2 size={16} className="text-amber-500" />
                  <span>{user.companyName || user.businessName}</span>
                </div>
              </div>

              {/* Company Logo Box */}
              <div className="border border-slate-800 bg-slate-950/50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-amber-500 mb-2 border border-slate-700 shadow-inner">
                  <Building2 size={32} />
                </div>
                <span className="text-xs text-slate-400 font-medium">Company Logo</span>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 text-sm text-slate-300 border-t border-slate-800 pt-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>{user.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-amber-500 shrink-0" />
                  <span>{user.phone}</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-amber-500 shrink-0" />
                  <span className="truncate">{user.email}</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                </div>
              </div>

              {/* Trust Profile Prompt */}
              <div className="border-t border-slate-800 pt-4 text-sm">
                <p className="text-slate-400">View / Build your Trust Profile? <span className="text-amber-400 font-semibold cursor-pointer hover:underline">Click here</span></p>
              </div>
            </div>

            {/* Right Side Cards: Business & Bank Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Business Details Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-white">Business Details</h2>
                  <button className="text-amber-500 hover:text-amber-400 flex items-center gap-1 text-sm font-semibold">
                    <Edit3 size={16} /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-slate-400 text-xs block mb-1">GSTIN</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white">{user.gstin || 'Not Provided'}</span>
                      {user.gstin && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-slate-400 text-xs block mb-1">PAN</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white">{user.pan || 'Not Provided'}</span>
                      {user.pan && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-slate-400 text-xs block mb-1">Udyam Number</span>
                    <span className="font-mono font-bold text-white">{user.udyamNumber || '+ Add Udyam Number'}</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-slate-400 text-xs block mb-1">Aadhaar / ID Number</span>
                    <span className="font-mono font-bold text-white">{user.aadhaarNumber ? '[Redacted Secure ID]' : '+ Add ID'}</span>
                  </div>
                </div>
              </div>

              {/* Bank Details Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-white">Bank Details</h2>
                  <button className="text-amber-500 hover:text-amber-400 flex items-center gap-1 text-sm font-semibold">
                    <Edit3 size={16} /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-slate-400 text-xs block mb-1">Account Number</span>
                    <span className="font-mono font-bold text-white">{user.accountNumber || '+ Add Account Number'}</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-slate-400 text-xs block mb-1">IFSC Code</span>
                    <span className="font-mono font-bold text-white uppercase">{user.ifsc || '+ Add IFSC'}</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-slate-400 text-xs block mb-1">Account Holder Name</span>
                    <span className="font-bold text-white">{user.accountHolderName || '+ Add Name'}</span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
                    <span className="text-slate-400 text-xs block mb-1">Bank Name</span>
                    <span className="font-bold text-white">{user.bankName || '+ Add Bank Name'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab !== 'primary' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <h2 className="text-2xl font-bold text-white capitalize">{activeTab} Section</h2>
            <p className="text-slate-400 max-w-md mx-auto">This module for your dealer portal is fully customizable. Manage your catalog, trust certificates, and website pages directly here.</p>
            <button 
              onClick={() => setActiveTab('primary')}
              className="bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-lg hover:bg-amber-400 transition"
            >
              Back to Primary Details
            </button>
          </div>
        )}

      </div>
    </div>
  );
}