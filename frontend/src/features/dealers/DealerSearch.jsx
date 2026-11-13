import {detectLocation,saveLocation} from '../../shared/location.js';
import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  MapPin, Phone, Building2, UserCheck, ShieldAlert, 
  Search, IndianRupee, Sparkles, Award, Loader2 
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// Fire-and-forget: notifies admin that a customer engaged with a dealer's
// Call button. Never awaited by the caller and never blocks the tel:
// navigation - failures are silently ignored here.
const notifyDealerClick = (dealerId, dealerName, actionType) => {
  if (!dealerId) return;
  fetch(`${API_BASE}/api/notify-click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dealerId, dealerName, actionType })
  }).catch(() => {});
};

export default function DealerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initial search value from URL query params or localStorage
  const initialQuery = 
    searchParams.get("location") || 
    searchParams.get("city") || 
    searchParams.get("pincode") || 
    localStorage.getItem("userLocation") || 
    "";

  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  async function useCurrentLocation() {
    setLocating(true);
    setLocationMessage('');
    try {
      const place = await detectLocation();
      setSearchTerm(place.city);
      localStorage.setItem('userLocation', place.city);
      setSearchParams({ location: place.city });
    } catch (error) {
      setLocationMessage(error instanceof TypeError || error.name === 'TimeoutError'
        ? 'Address lookup is unavailable. Enter your city or pincode.'
        : error.message);
    } finally {
      setLocating(false);
    }
  }

  const requestRef = useRef(null);
  useEffect(()=>()=>requestRef.current?.abort(),[]);
  const [searchFailed, setSearchFailed] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  const fetchDealers = async (query) => {
    requestRef.current?.abort();
    const controller=new AbortController();
    requestRef.current=controller;
    setLoading(true);
    setSearchFailed(false);
    try {
      const endpoint = query 
        ? `${API_BASE}/api/dealers/search?location=${encodeURIComponent(query)}`
        : `${API_BASE}/api/dealers/search`;

      const res = await fetch(endpoint,{signal:controller.signal});
      const data = await res.json();
      
      if (res.ok && data.success && Array.isArray(data.dealers)) {
        setDealers(data.dealers);
      } else {
        setSearchFailed(true);
        setDealers([]);
      }
    } catch (err) {
      if(controller.signal.aborted)return;
      setSearchFailed(true);
      setDealers([]);
    } finally {
      if(!controller.signal.aborted)setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      localStorage.setItem("userLocation", searchTerm.trim());
      saveLocation({city:searchTerm.trim(),source:'manual'});
      setSearchParams({ location: searchTerm.trim() });
      fetchDealers(searchTerm.trim());
    } else {
      localStorage.removeItem("userLocation");
      setSearchParams({});
      fetchDealers("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Multi-field Location Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="w-full md:w-1/2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <MapPin className="text-amber-500 shrink-0" /> Verified Shutter Dealers
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {searchTerm ? (
                <span>Showing active fabricators in or near: <strong className="text-amber-400">{searchTerm}</strong></span>
              ) : (
                <span>Browse all verified & active fabricator workshops across regions.</span>
              )}
            </p>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4"><button type="button" className="warm-button" disabled={locating} onClick={useCurrentLocation}>{locating ? 'Finding your city…' : 'Use my location ↗'}</button><span className="text-sm text-slate-500">Or search by city, area or pincode below. City lookup uses approximate coordinates. <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>.</span>{locationMessage && <p role="status" className="text-sm text-slate-700">{locationMessage}</p>}</div>
      <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-1/2">
            <div className="relative w-full">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by City, Area or Pincode..."
                className="w-full bg-slate-800/80 border border-slate-700 pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
            <button 
              type="submit" 
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition text-sm shrink-0 flex items-center gap-2"
            >
              Search
            </button>
          </form>
        </div>

        {/* Dealers Grid / Results Section */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-amber-500" size={32} />
            <span>Fetching subscribed local fabricators...</span>
          </div>
        ) : searchFailed ? (
          <div role="alert" className="text-center py-16">
            <p>We couldn’t load the dealer directory.</p>
            <button className="quiet-link mt-4" onClick={() => fetchDealers(initialQuery)}>Try again</button>
          </div>
        ) : dealers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealers.map((dealer) => (
              <div 
                key={dealer._id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-amber-500/50 transition duration-300 relative group"
              >
                <div>
                  {/* Badges Bar */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                      <UserCheck size={14} /> Active Verified Dealer
                    </span>

                    {dealer.gstin && (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/20">
                        GST REGISTERED
                      </span>
                    )}
                  </div>

                  {/* Company & Owner Info */}
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2 group-hover:text-amber-400 transition">
                    <Building2 size={20} className="text-amber-500 shrink-0" /> {dealer.companyName}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Proprietor: <span className="text-slate-200 font-medium">{dealer.name}</span>
                    {dealer.experienceYears && <span className="ml-2 text-slate-500">({dealer.experienceYears})</span>}
                  </p>

                  {/* Pricing Highlight Box */}
                  {dealer.perKgPrice && (
                    <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                        <Sparkles size={14} className="text-amber-400" /> Standard Rate:
                      </span>
                      <span className="text-lg font-black text-amber-400 font-mono flex items-center">
                        ₹{dealer.perKgPrice} <span className="text-xs font-normal text-slate-400 ml-1">/ kg</span>
                      </span>
                    </div>
                  )}

                  {/* Location & Services */}
                  <div className="space-y-2 text-xs text-slate-300 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    <p className="flex items-start gap-2">
                      <MapPin size={16} className="text-amber-500 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{dealer.address || `${dealer.area}, ${dealer.city}`}</span>
                    </p>

                    {dealer.servicesOffered && (
                      <p className="text-slate-400 pt-2 border-t border-slate-800 flex items-start gap-1">
                        <Award size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{dealer.servicesOffered}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <Link
                    to={`/dealer/${dealer._id}`}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 border border-slate-700 text-sm"
                  >
                    View Full Workshop Profile
                  </Link>
                  <a
                    href={`tel:${dealer.phone}`}
                    onClick={() => notifyDealerClick(dealer._id, dealer.companyName, 'call')}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg text-sm"
                  >
                    <Phone size={16} /> Direct Call: {dealer.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
            {initialQuery && <p className="mb-6 text-slate-600">No subscribed dealers matched “{initialQuery}”.</p>}
            <p className="eyebrow">Our workshop</p>
            <h2 className="text-3xl">Tameer Fabricators</h2>
            <p className="mt-2 flex items-center gap-2 text-slate-600"><MapPin size={16} /> Bareilly, Uttar Pradesh</p>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <a className="warm-button" href="tel:+918439860719"><Phone size={16} /> Call workshop</a>
              <Link className="quiet-link" to="/#contact-form">Request a callback ↗</Link>
              {initialQuery && <button className="quiet-link" onClick={() => {
                localStorage.removeItem("userLocation");
                setSearchTerm("");
                setSearchParams({});
              }}>View all locations</button>}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}