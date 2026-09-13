import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MyWorkshop() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Price update states
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [perKgPrice, setPerKgPrice] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://tameer-fabricator-backend.onrender.com';
const BACKEND_URL = API_BASE; 



  useEffect(() => {
    fetchDealerData();
  }, []);

  const fetchDealerData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch user profile & leads in parallel
      const [profileRes, leadsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/auth/profile`, config),
        axios.get(`${BACKEND_URL}/api/auth/my-leads`, config)
      ]);

      setUser(profileRes.data.user || profileRes.data);
      setPerKgPrice(profileRes.data.user?.perKgPrice || profileRes.data.perKgPrice || '');
      setLeads(leadsRes.data.leads || leadsRes.data || []);
    } catch (err) {
      console.error('Error fetching workshop data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePriceUpdate = async (e) => {
    e.preventDefault();
    setSavingPrice(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${BACKEND_URL}/api/auth/update-price`,
        { perKgPrice: Number(perKgPrice) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(res.data.user || { ...user, perKgPrice: Number(perKgPrice) });
      setIsEditingPrice(false);
      setMessage({ type: 'success', text: 'Per KG Price updated successfully across all listings!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update price.' });
    } finally {
      setSavingPrice(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your workshop?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-amber-500">
        <div className="animate-spin rounded-full h-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{user?.companyName || user?.name || 'Workshop Portal'}</h1>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
                {user?.businessType || 'Verified Dealer'}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              {user?.city ? `${user.city}, ${user.state}` : 'Location not set'} • {user?.category || 'Rolling Shutters & Gates'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition-all"
          >
            Logout Workshop
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Workshop Details & Price Manager */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-3">Business Profile</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Owner Name</span>
                  <span className="font-medium text-slate-200">{user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Phone Number</span>
                  <span className="font-medium text-slate-200">{user?.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Email Address</span>
                  <span className="font-medium text-slate-200">{user?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">GSTIN / Tax ID</span>
                  <span className="font-medium text-slate-200">{user?.gstin || 'Not Provided'}</span>
                </div>
              </div>

              {/* Editable Price Section */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-300">Per KG Rate</span>
                  {!isEditingPrice && (
                    <button
                      onClick={() => setIsEditingPrice(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Edit Price
                    </button>
                  )}
                </div>

                {isEditingPrice ? (
                  <form onSubmit={handlePriceUpdate} className="space-y-3">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">₹</span>
                      <input
                        type="number"
                        value={perKgPrice}
                        onChange={(e) => setPerKgPrice(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                        placeholder="Enter rate"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={savingPrice}
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs transition-all"
                      >
                        {savingPrice ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingPrice(false)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-2xl font-bold text-amber-400">
                    ₹{user?.perKgPrice || 0} <span className="text-xs font-normal text-slate-400">/ kg</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Leads / Notifications */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  Customer Leads & Inquiries
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                    {leads.length}
                  </span>
                </h3>
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No customer leads received yet. When customers submit shutter estimates near your area, they will appear here.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {leads.map((lead) => (
                    <div key={lead._id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">{lead.name}</h4>
                          <a href={`tel:${lead.phone}`} className="text-amber-400 text-sm hover:underline font-mono">
                            📞 {lead.phone}
                          </a>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/60 p-2.5 rounded-lg text-xs text-slate-300">
                        <div><span className="text-slate-500 block">Width:</span> {lead.width || 'N/A'} {lead.unit}</div>
                        <div><span className="text-slate-500 block">Height:</span> {lead.height || 'N/A'} {lead.unit}</div>
                        <div><span className="text-slate-500 block">Type:</span> {lead.shutterType || 'Manual'}</div>
                      </div>

                      {lead.message && (
                        <p className="text-xs text-slate-400 italic bg-slate-900/30 p-2 rounded">
                          "{lead.message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}