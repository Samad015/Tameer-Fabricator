import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, Phone, Building2, UserCheck, ShieldAlert } from "lucide-react";

export default function DealerDashboard() {
  const [searchParams] = useSearchParams();
  const pincodeQuery = searchParams.get("pincode") || localStorage.getItem("userPincode") || "";
  
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState(pincodeQuery);

  const fetchDealers = async (pin) => {
    if (!pin) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dealers/search?pincode=${pin}`);
      const data = await res.json();
      if (data.success) {
        setDealers(data.dealers);
      }
    } catch (err) {
      console.error("Error fetching dealers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pincodeQuery) {
      fetchDealers(pincodeQuery);
    } else {
      setLoading(false);
    }
  }, [pincodeQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (pincode) {
      localStorage.setItem("userPincode", pincode);
      fetchDealers(pincode);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <MapPin className="text-amber-500" /> Local Fabricator & Dealer Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Showing verified rolling shutter & metal fabrication experts near pincode: <span className="text-amber-400 font-mono font-bold">{pincode || "Not Set"}</span>
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Change Pincode..."
              maxLength="6"
              className="bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-mono"
            />
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition text-sm">
              Search
            </button>
          </form>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading nearby dealers...</div>
        ) : dealers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealers.map((dealer) => (
              <div key={dealer._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-amber-500/50 transition">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                      <UserCheck size={14} /> Verified Partner
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Building2 size={20} className="text-amber-500" /> {dealer.companyName}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Owner: <span className="text-slate-200">{dealer.name}</span></p>

                  <div className="space-y-2 text-sm text-slate-300 mb-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                    <p className="flex items-start gap-2">
                      <MapPin size={16} className="text-amber-500 mt-1 shrink-0" />
                      <span>{dealer.address}, Area: {dealer.area}, City: {dealer.city}</span>
                    </p>
                    {dealer.pricingDetails && (
                      <p className="text-xs text-amber-300 font-medium mt-2 pt-2 border-t border-slate-800">
                        <strong>Pricing / Offer:</strong> {dealer.pricingDetails}
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={`tel:${dealer.phone}`}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                >
                  <Phone size={18} /> Call Dealer: {dealer.phone}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <ShieldAlert size={48} className="mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Dealers Found in this Pincode</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Currently there are no active subscribed dealers registered for pincode <strong>{pincode}</strong>. Try searching a nearby pincode or call our main support line.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}