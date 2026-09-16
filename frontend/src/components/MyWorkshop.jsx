import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Building2, MapPin, Phone, IndianRupee, Edit3, Check, X,
  Bell, LogOut, Loader2, Award, FileText, Calendar, Ruler,
  MessageSquare, BellOff, RefreshCw, AlertCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://tameer-fabricator.onrender.com';

export default function MyWorkshop() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout, fetchUserSession } = useContext(AuthContext);

  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  const [leads, setLeads] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState('');

  // Redirect away only once the auth check has actually finished,
  // otherwise we would bounce the dealer to /login during session restore.
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  const fetchLeads = async (showSpinner = true) => {
    if (showSpinner) setLeadsLoading(true);
    setLeadsError('');
    const token = localStorage.getItem('token');

    if (!token) {
      setLeadsError('Session expired. Please log in again.');
      setLeadsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/my-leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setLeads(data.leads || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        setLeadsError(data.message || 'Could not load leads.');
      }
    } catch (err) {
      console.error('Fetch Leads Error:', err);
      setLeadsError('Network error while loading leads.');
    } finally {
      setLeadsLoading(false);
    }
  };

  // Initial fetch + poll every 30s so new customer inquiries appear
  // without the dealer needing to reload the page.
  useEffect(() => {
    if (!user) return;

    fetchLeads();
    const interval = setInterval(() => fetchLeads(false), 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleStartEditPrice = () => {
    setNewPrice(user?.perKgPrice || '');
    setIsEditingPrice(true);
  };

  const handleCancelEditPrice = () => {
    setIsEditingPrice(false);
    setNewPrice('');
  };

  const handleSavePrice = async () => {
    const priceValue = Number(newPrice);

    if (!newPrice || isNaN(priceValue) || priceValue <= 0) {
      alert('Please enter a valid positive price.');
      return;
    }

    setSavingPrice(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE}/api/auth/update-price`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ perKgPrice: priceValue })
      });

      const data = await response.json();

      if (data.success) {
        await fetchUserSession();
        setIsEditingPrice(false);
        setNewPrice('');
      } else {
        alert(data.message || 'Failed to update price.');
      }
    } catch (err) {
      console.error('Update Price Error:', err);
      alert('Server error while updating price.');
    } finally {
      setSavingPrice(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-amber-500" size={32} />
        <p className="text-sm text-slate-400">Loading your workshop...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-2xl shrink-0">
                {user.companyName?.charAt(0) || user.name?.charAt(0) || 'D'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Building2 size={20} className="text-amber-500" /> {user.companyName || user.name}
                </h1>
                <p className="text-sm text-slate-400">Proprietor: {user.name}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/40 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Workshop Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText size={16} /> Workshop Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <MapPin size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Location</p>
                <p className="text-slate-200 font-medium">{user.address || `${user.area || ''}, ${user.city || ''}`}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <Phone size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Phone</p>
                <p className="text-slate-200 font-medium">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <Award size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Experience</p>
                <p className="text-slate-200 font-medium">{user.experienceYears || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <Ruler size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Services</p>
                <p className="text-slate-200 font-medium line-clamp-2">{user.servicesOffered || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Price Card */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <IndianRupee size={16} /> Per KG Shutter Price
          </h2>

          {!isEditingPrice ? (
            <div className="flex items-center justify-between">
              <div className="text-3xl font-black text-amber-400 flex items-center gap-1">
                <IndianRupee size={26} />
                <span>{user.perKgPrice || '0'}</span>
                <span className="text-sm text-slate-400 font-normal ml-1">/ kg</span>
              </div>
              <button
                onClick={handleStartEditPrice}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-sm font-bold transition"
              >
                <Edit3 size={16} /> Update Price
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="number"
                  autoFocus
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Enter new price"
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSavePrice}
                  disabled={savingPrice}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50"
                >
                  {savingPrice ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save
                </button>
                <button
                  onClick={handleCancelEditPrice}
                  disabled={savingPrice}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl text-sm font-bold transition border border-slate-700"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-3">
            This rate is shown to customers on your public profile and used in their price estimator.
          </p>
        </div>

        {/* Leads / Notifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-amber-500 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Bell size={16} /> Customer Leads
            </h2>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
              <button
                onClick={() => fetchLeads()}
                disabled={leadsLoading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={leadsLoading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {leadsError && (
            <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl">
              <AlertCircle size={16} className="shrink-0" />
              <span>{leadsError}</span>
            </div>
          )}

          {leadsLoading ? (
            <div className="text-center py-10 text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-amber-500" size={24} />
              <span className="text-sm">Loading leads...</span>
            </div>
          ) : leads.length > 0 ? (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead._id}
                  className={`rounded-xl p-4 border ${lead.isRead ? 'bg-slate-950/40 border-slate-800' : 'bg-amber-500/5 border-amber-500/30'}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-amber-500 shrink-0" />
                      <span className="font-bold text-white text-sm">{lead.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                      <Calendar size={12} /> {formatDate(lead.createdAt)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300 mb-2">
                    <span><strong className="text-slate-500">Phone:</strong> {lead.phone}</span>
                    <span><strong className="text-slate-500">Size:</strong> {lead.width || '-'} x {lead.height || '-'} {lead.unit}</span>
                    <span><strong className="text-slate-500">Type:</strong> {lead.shutterType}</span>
                  </div>
                  {lead.message && (
                    <p className="text-xs text-slate-400 border-t border-slate-800 pt-2 mt-2">{lead.message}</p>
                  )}
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-amber-400 hover:text-amber-300"
                  >
                    <Phone size={12} /> Call back
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <BellOff size={32} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No customer leads yet. New inquiries will show up here.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}