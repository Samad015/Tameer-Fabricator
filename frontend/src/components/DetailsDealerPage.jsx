import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Search, Loader2, IndianRupee, FileText, User } from 'lucide-react';

export default function DetailsDealerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    businessName: '',
    businessType: 'Proprietorship',
    experienceYears: '',
    address: '',
    landmark: '',
    area: '',
    city: '',
    state: 'Uttar Pradesh',
    pincode: '',
    perKgPrice: '',
    pricingDetails: '',
    servicesOffered: '',
    gstin: '',
    pan: '',
    udyamNumber: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // OpenStreetMap Nominatim Live Suggestions
  useEffect(() => {
    if (addressQuery.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&countrycodes=in&addressdetails=1&limit=5`
        );
        const data = await response.json();
        setAddressSuggestions(data);
      } catch (err) {
        console.error('Address suggestion error:', err);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [addressQuery]);

  const handleSelectAddress = (item) => {
    const addr = item.address || {};
    const cityVal = addr.city || addr.town || addr.village || addr.state_district || '';
    const areaVal = addr.suburb || addr.neighbourhood || addr.road || '';
    
    setFormData((prev) => ({
      ...prev,
      address: item.display_name,
      area: areaVal || cityVal,
      city: cityVal,
      state: addr.state || 'Uttar Pradesh',
      pincode: addr.postcode || ''
    }));
    setAddressQuery(item.display_name);
    setAddressSuggestions([]);
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!formData.city || !formData.pincode) {
      alert('Please select a valid address from suggestions.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dealer/complete-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.success) {
        alert('Profile completed successfully!');
        navigate('/dashboard'); // Direct render to dashboard & stays logged in
      } else {
        alert(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Profile Update Error:', err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Complete Workshop Profile</h2>
        <p className="text-center text-slate-400 text-sm mb-8">Provide your business specifications to start receiving local customer requests.</p>

        <form onSubmit={handleCompleteProfile} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={16} /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} required className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500" />
              <input type="text" name="phone" placeholder="Primary Mobile Number *" value={formData.phone} onChange={handleChange} required className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          {/* Business Info */}
          <div>
            <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building2 size={16} /> Business Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" name="businessName" placeholder="Business / Shop Name *" value={formData.businessName} onChange={handleChange} required className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500" />
              <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500">
                <option value="Proprietorship">Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Private Limited">Private Limited</option>
              </select>
              <input type="text" name="experienceYears" placeholder="Years in Business (e.g. 5 Years)" value={formData.experienceYears} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          {/* Location with Suggestions */}
          <div>
            <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={16} /> Workshop Location Mapping
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-500 pointer-events-none"><Search size={18} /></span>
                  <input
                    type="text"
                    placeholder="Search address / area / city *"
                    value={addressQuery}
                    onChange={(e) => { setAddressQuery(e.target.value); setFormData({ ...formData, address: e.target.value }); }}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-11 pr-10 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  {isSearchingAddress && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-500"><Loader2 size={16} className="animate-spin" /></span>}
                </div>
                {addressSuggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {addressSuggestions.map((item, index) => (
                      <li key={index} onClick={() => handleSelectAddress(item)} className="px-4 py-3 text-xs sm:text-sm text-slate-200 hover:bg-slate-700 hover:text-amber-400 cursor-pointer border-b border-slate-700 flex items-start gap-2">
                        <MapPin size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{item.display_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" name="city" placeholder="City *" value={formData.city} onChange={handleChange} required className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500" />
                <input type="text" name="state" placeholder="State *" value={formData.state} onChange={handleChange} required className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500" />
                <input type="text" name="pincode" placeholder="Pincode *" value={formData.pincode} onChange={handleChange} maxLength={6} required className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500" />
              </div>
            </div>
          </div>

          {/* Pricing & Per KG Field */}
          <div>
            <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <IndianRupee size={16} /> Pricing & Catalog
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-500 pointer-events-none"><IndianRupee size={16} /></span>
                <input type="number" name="perKgPrice" placeholder="Per KG Shutter Price (₹) *" value={formData.perKgPrice} onChange={handleChange} required className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <input type="text" name="servicesOffered" placeholder="Services (e.g. Installation, Motor Repair)" value={formData.servicesOffered} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          {/* Compliance */}
          <div>
            <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText size={16} /> Legal & Compliance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" name="gstin" placeholder="GSTIN Number (Optional)" value={formData.gstin} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm uppercase focus:outline-none focus:border-amber-500" />
              <input type="text" name="pan" placeholder="PAN Card Number" value={formData.pan} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm uppercase focus:outline-none focus:border-amber-500" />
              <input type="text" name="udyamNumber" placeholder="Udyam Number" value={formData.udyamNumber} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-4 rounded-xl font-bold uppercase tracking-wider transition cursor-pointer">
            {loading ? 'Saving Profile...' : 'Save & Go to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}