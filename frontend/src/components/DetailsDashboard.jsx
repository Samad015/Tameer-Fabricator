import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, User, MapPin, Briefcase, 
  ShieldCheck, Edit3, Save, X, Loader2 
} from "lucide-react";

export default function DealerDashboard() {
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({});

  // Dynamic API URL for Render production & local development
 const API_BASE_URL = import.meta.env.VITE_API_URL || "";
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setDealer(data.user);
        setFormData(data.user);
      } else {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        alert("Profile updated successfully!");
        setDealer(data.user || formData);
        setIsEditing(false);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert("Something went wrong while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!dealer) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/20 inline-flex items-center gap-1 mb-2">
              <ShieldCheck size={14} /> {dealer.isVerified ? "Verified Dealer Account" : "Pending Verification"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Building2 className="text-amber-500" /> {dealer.companyName}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your workshop profile, pricing catalog, and business details.
            </p>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-sm shadow-md"
            >
              <Edit3 size={16} /> Edit Profile & Pricing
            </button>
          ) : (
            <button
              onClick={() => { setIsEditing(false); setFormData(dealer); }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-sm border border-slate-700"
            >
              <X size={16} /> Cancel
            </button>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={16} /> Personal & Contact Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-xs">Owner Name</span>
                  <span className="font-semibold text-white">{dealer.name}</span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-xs">Email Address</span>
                  <span className="font-semibold text-white">{dealer.email}</span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-xs">Phone Number</span>
                  <span className="font-semibold text-white">{dealer.phone}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase size={16} /> Business & Pricing Catalog
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-xs">Business Type</span>
                  <span className="font-semibold text-white">{dealer.businessType || 'Proprietorship'}</span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-xs">Experience</span>
                  <span className="font-semibold text-white">{dealer.experienceYears || 'Not specified'}</span>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <span className="text-amber-400 block text-xs font-medium">Per KG Shutter Price</span>
                  <span className="font-black text-amber-300 text-lg">₹{dealer.perKgPrice || 0} / KG</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-xs">Pricing Details / Highlights</span>
                  <span className="text-slate-200">{dealer.pricingDetails || 'No special pricing highlights added.'}</span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-xs">Services Offered</span>
                  <span className="text-slate-200">{dealer.servicesOffered || 'General Manufacturing & Installation'}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin size={16} /> Workshop Location
              </h3>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-sm space-y-2">
                <p><strong>Address:</strong> {dealer.address}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs text-slate-300">
                  <div>Area: <strong>{dealer.area}</strong></div>
                  <div>City: <strong>{dealer.city}</strong></div>
                  <div>State: <strong>{dealer.state}</strong></div>
                  <div>Pincode: <strong className="text-amber-400 font-mono">{dealer.pincode}</strong></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-3">Edit Workshop & Pricing Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Company / Workshop Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Per KG Shutter Price (₹)</label>
                <input
                  type="number"
                  name="perKgPrice"
                  value={formData.perKgPrice || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Business Type</label>
                <select
                  name="businessType"
                  value={formData.businessType || "Proprietorship"}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Private Limited">Private Limited</option>
                  <option value="Individual Fabricator">Individual Fabricator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Experience Years</label>
                <input
                  type="text"
                  name="experienceYears"
                  value={formData.experienceYears || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Pricing Highlight</label>
                <input
                  type="text"
                  name="pricingDetails"
                  value={formData.pricingDetails || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Services Offered</label>
                <input
                  type="text"
                  name="servicesOffered"
                  value={formData.servicesOffered || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { setIsEditing(false); setFormData(dealer); }}
                className="bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}