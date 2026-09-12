import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  MapPin, Phone, Building2, UserCheck, ShieldAlert, 
  Search, IndianRupee, Sparkles, Award, Loader2 
} from "lucide-react";

export default function DealerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initial search value from URL query params or localStorage
  const initialQuery = 
    searchParams.get("location") || 
    searchParams.get("city") || 
    searchParams.get("pincode") || 
    localStorage.getItem("userLocation") || 
    "";

  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  const fetchDealers = async (query) => {
    setLoading(true);
    try {
      const endpoint = query 
        ? `/api/dealers/search?location=${encodeURIComponent(query)}`
        : `/api/dealers/search`;

      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (data.success) {
        setDealers(data.dealers);
      } else {
        setDealers([]);
      }
    } catch (err) {
      console.error("Error fetching dealers:", err);
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      localStorage.setItem("userLocation", searchTerm.trim());
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
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg text-sm"
                  >
                    <Phone size={16} /> Direct Call: {dealer.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <ShieldAlert size={48} className="mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Subscribed Fabricators Found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              There are currently no active registered dealers for <strong className="text-amber-400">{searchTerm || "this location"}</strong>.
            </p>
            <button 
              onClick={() => { setSearchTerm(''); fetchDealers(''); }} 
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 text-sm font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition"
            >
              View All Locations
            </button>
          </div>
        )}

      </div>
    </div>
  );
}