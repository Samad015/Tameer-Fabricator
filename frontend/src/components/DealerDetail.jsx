import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Phone, Mail, MapPin, MessageCircle, Calculator, ArrowRight, 
  IndianRupee, RefreshCw, Lock, FileText, Building, 
  Ruler, ChevronDown, Send, CheckCircle2, AlertCircle, Loader2, Wrench, Award, UserCheck
} from "lucide-react";

const HERO_IMAGE = "/images/dealer-hero.jpeg";

function Estimator({ dealerRate = 95 }) {
  // Dynamic or fallback rate per kg
  const PRICE_PER_KG = Number(dealerRate) || 95;
  const INCHES_TO_FEET = 1 / 12;

  // State Management
  const [shutterType, setShutterType] = useState('manual'); // 'manual', 'gear', 'motorized'
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);

  // Unit Selection State (Feet / Inches)
  const [unit, setUnit] = useState('feet');
  const [showUnitPopup, setShowUnitPopup] = useState(false);

  // Dynamic Density Based on Selected Shutter Type
  const weightPerSqFt = shutterType === 'manual' ? 2.2 : shutterType === 'gear' ? 2.6 : 3.0;

  const handleCalculate = (e) => {
    e.preventDefault();
    let w = parseFloat(width) || 0;
    let h = parseFloat(height) || 0;

    // Convert entered dimensions to feet if unit selected is inches
    if (unit === 'inches') {
      w = w * INCHES_TO_FEET;
      h = h * INCHES_TO_FEET;
    }

    const area = w * h;
    const weight = area * weightPerSqFt;
    const price = weight * PRICE_PER_KG;

    setResult({
      type: shutterType === 'manual' ? 'Manual Shutter' : shutterType === 'gear' ? 'Gear Shutter' : 'Motorized Shutter',
      totalSqFt: area,
      totalWeight: weight,
      estimatedPrice: price,
    });
  };

  // Calculations for Summary Table
  const shutterCost = result ? result.estimatedPrice : 0;
  const lockCost = 700;
  const gearCost = shutterType === 'gear' ? 5000 : 0;
  const motorCost = shutterType === 'motorized' ? 30000 : 0;
  const finalTotal = shutterCost + lockCost + gearCost + motorCost;

  return (
    <section id="estimator" className="py-16 bg-white text-slate-900 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-600 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide mb-3">
            <Calculator size={18} /> Instant Price Estimator
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
            Calculate Shutter Cost
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Calculate actual weight & estimated price using dealer's active rate (<strong>₹{PRICE_PER_KG}/kg</strong>).
          </p>
        </div>

        {/* Calculator Box */}
        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xl grid md:grid-cols-2 gap-8 items-start">
          
          {/* Inputs Form */}
          <form onSubmit={handleCalculate} className="space-y-4">
            
            {/* Shutter Type Selector Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                Select Shutter Type *
              </label>
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-white border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setShutterType('manual'); setResult(null); }}
                  className={`py-2 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    shutterType === 'manual' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Manual 
                </button>
                <button
                  type="button"
                  onClick={() => { setShutterType('gear'); setResult(null); }}
                  className={`py-2 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    shutterType === 'gear' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Gear 
                </button>
                <button
                  type="button"
                  onClick={() => { setShutterType('motorized'); setResult(null); }}
                  className={`py-2 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    shutterType === 'motorized' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Motorized 
                </button>
              </div>
            </div>

            {/* Unit Selector */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                Select Input Unit *
              </label>
              <button
                type="button"
                onClick={() => setShowUnitPopup(!showUnitPopup)}
                className="w-full flex items-center justify-between gap-2 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold hover:border-amber-500 transition cursor-pointer text-sm"
              >
                <span className="flex items-center gap-2">
                  <Ruler size={16} className="text-amber-500" />
                  {unit === 'feet' ? 'Feet (ft)' : 'Inches (in)'}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showUnitPopup ? 'rotate-180' : ''}`} />
              </button>

              {showUnitPopup && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setUnit('feet'); setShowUnitPopup(false); setResult(null); }}
                    className={`w-full text-left px-3.5 py-2.5 text-sm font-bold transition ${
                      unit === 'feet' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Feet (ft)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUnit('inches'); setShowUnitPopup(false); setResult(null); }}
                    className={`w-full text-left px-3.5 py-2.5 text-sm font-bold transition ${
                      unit === 'inches' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Inches (in)
                  </button>
                </div>
              )}
            </div>

            {/* Editable Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
                  Width ({unit === 'feet' ? 'ft' : 'in'})
                </label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={width} 
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-bold text-sm"
                  placeholder={`Width in ${unit}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
                  Height ({unit === 'feet' ? 'ft' : 'in'})
                </label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-bold text-sm"
                  placeholder={`Height in ${unit}`}
                />
              </div>
            </div>

            {/* Fixed Rate & Weight Cards */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                  Density <Lock size={12} />
                </label>
                <input 
                  type="text" 
                  readOnly 
                  disabled
                  value={`${weightPerSqFt} kg/ft²`}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 font-bold text-xs cursor-not-allowed select-none"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                  Dealer Rate <Lock size={12} />
                </label>
                <input 
                  type="text" 
                  readOnly 
                  disabled
                  value={`₹${PRICE_PER_KG} / kg`}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-amber-600 font-bold text-xs cursor-not-allowed select-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg mt-4 cursor-pointer"
            >
              <RefreshCw size={18} /> Calculate Estimate
            </button>
          </form>

          {/* Results Display */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center flex flex-col justify-between min-h-[340px]">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200 pb-3">
              Calculated Specifications
            </h3>

            {result ? (
              <div className="space-y-6 my-auto py-2">
                <div className="inline-block bg-amber-50 border border-amber-300 text-amber-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {result.type}
                </div>

                <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">Total Area</span>
                    <span className="text-base font-black text-slate-900">{result.totalSqFt.toFixed(2)} sq. ft.</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">Approx Weight</span>
                    <span className="text-base font-black text-amber-600">{result.totalWeight.toFixed(2)} kg</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-xs uppercase tracking-widest block mb-1 font-semibold">
                    Actual Shutter Price
                  </span>
                  <div className="text-3xl font-black text-amber-600 flex items-center justify-center gap-1">
                    <IndianRupee size={24} />
                    <span>{result.estimatedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">*Basic raw shutter material estimate</span>
                </div>

                <a 
                  href="#contact-form" 
                  className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider"
                >
                  Request Official Quote <ArrowRight size={16} />
                </a>
              </div>
            ) : (
              <div className="my-auto py-10 text-slate-400 text-sm space-y-2">
                <Calculator className="mx-auto text-slate-300 mb-2" size={40} />
                <p>Select shutter type, enter dimensions, and click <strong>"Calculate Estimate"</strong> to view exact weight & price.</p>
              </div>
            )}
          </div>

        </div>

        {/* Breakdown Table */}
        <div className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-md">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
            <FileText size={18} className="text-amber-500" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
              Detailed Cost Component Breakdown
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm text-slate-600">
              <thead>
                <tr className="bg-white text-amber-600 uppercase font-extrabold border-b border-slate-200">
                  <th className="p-3">Component</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Amount / Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-white">
                  <td className="p-3 font-semibold text-slate-900">Actual Shutter Price</td>
                  <td className="p-3 text-slate-500">Weight × ₹{PRICE_PER_KG}/kg</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-600">
                    ₹{shutterCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {shutterType === 'gear' && (
                  <tr className="hover:bg-white">
                    <td className="p-3 font-semibold text-slate-900">Gear Mechanism Charges</td>
                    <td className="p-3 text-slate-500">Fixed Standard Charge</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-600">₹5,000.00</td>
                  </tr>
                )}

                {shutterType === 'motorized' && (
                  <tr className="hover:bg-white">
                    <td className="p-3 font-semibold text-slate-900">Electric Motor Charges</td>
                    <td className="p-3 text-slate-500">Fixed Standard Motor</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-600">₹30,000.00</td>
                  </tr>
                )}

                <tr className="hover:bg-white">
                  <td className="p-3 font-semibold text-slate-900">Side Lock Set Charges</td>
                  <td className="p-3 text-slate-500">Fixed Pair Charge</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-600">₹700.00</td>
                </tr>

                <tr className="bg-white font-black text-slate-900 text-sm sm:text-base border-t-2 border-slate-200">
                  <td className="p-3 text-amber-600">Estimated Total</td>
                  <td className="p-3 text-amber-600/70 text-xs font-normal">Calculated Total</td>
                  <td className="p-3 text-right font-mono text-amber-600 font-extrabold">
                    ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}

function ContactForm({ dealerName = "", dealerEmail = "" }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    width: "",
    height: "",
    unit: "Feet",
    shutterType: "Manual",
    message: "",
  });

  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(false);
  const [showShutterPopup, setShowShutterPopup] = useState(false);
  const [showUnitPopup, setShowUnitPopup] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      setStatus({
        type: "error",
        message: "Name and Phone number are required fields.",
      });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dealerName,
          dealerEmail,
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({
          type: "success",
          message: data.message || "Quote request submitted successfully!",
        });
        setFormData({
          name: "",
          phone: "",
          width: "",
          height: "",
          unit: "Feet",
          shutterType: "Manual",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Failed to submit quote request.",
        });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      setStatus({
        type: "error",
        message: "Server error! Please check network connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact-form" className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-lg max-w-xl mx-auto">
      <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
        <Send size={20} className="text-amber-500" /> Send Quote Inquiry
      </h3>
      <p className="text-xs text-slate-500 mb-6">
        Directly send project specs to <strong className="text-slate-800">{dealerName || "Fabricator"}</strong>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {status.message && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
              status.type === "success"
                ? "bg-emerald-50 border border-emerald-300 text-emerald-700"
                : "bg-rose-50 border border-rose-300 text-rose-700"
            }`}
          >
            {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 00000 00000"
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Width</label>
            <input
              type="number"
              name="width"
              value={formData.width}
              onChange={handleChange}
              placeholder="e.g. 10"
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Height</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="e.g. 8"
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
            <button
              type="button"
              onClick={() => setShowUnitPopup(!showUnitPopup)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-left text-slate-900 focus:outline-none focus:border-amber-500 flex items-center justify-between"
            >
              <span>{formData.unit}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {showUnitPopup && (
              <div className="absolute z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                {["Feet", "Inches"].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => { setFormData({ ...formData, unit: u }); setShowUnitPopup(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-amber-500 hover:text-slate-950"
                  >
                    {u}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Shutter Type</label>
          <select
            name="shutterType"
            value={formData.shutterType}
            onChange={handleChange}
            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
          >
            <option value="Manual">Manual Shutter</option>
            <option value="Gear">Gear Shutter</option>
            <option value="Motorized">Motorized Shutter</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Additional Requirements</label>
          <textarea
            name="message"
            rows="3"
            value={formData.message}
            onChange={handleChange}
            placeholder="Specify gauge preference, color, or location..."
            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 text-slate-950 font-black py-3 rounded-xl hover:bg-amber-400 transition text-sm flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Submitting...</>
          ) : (
            <><Send size={16} /> Send Quote Request</>
          )}
        </button>
      </form>
    </div>
  );
}

export default function DealerProfile() {
  const { dealerId } = useParams();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealerProfile = async () => {
      try {
        const res = await fetch(`/api/dealers/${dealerId}`);
        const data = await res.json();
        if (data.success) {
          setDealer(data.dealer);
        }
      } catch (err) {
        console.error("Error fetching dealer profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (dealerId) {
      fetchDealerProfile();
    }
  }, [dealerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-amber-500" size={36} />
        <p className="text-sm text-slate-400">Loading dealer profile...</p>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-2">
        <AlertCircle size={40} className="text-amber-500" />
        <h2 className="text-xl font-bold">Dealer Not Found</h2>
        <p className="text-xs text-slate-400">The dealer profile you are looking for does not exist.</p>
      </div>
    );
  }

  const cleanPhone = dealer.phone ? dealer.phone.replace(/[^\d]/g, "") : "";
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${dealer.companyName}, I found your profile on Tameer Fabricators and would like to get a shutter quote.`)}`;

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="relative h-[360px] sm:h-[420px] overflow-hidden">
        <img src={HERO_IMAGE} alt="Fabrication Works" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        <div className="relative h-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-8">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/30 w-fit backdrop-blur-md">
            <UserCheck size={14} /> Subscribed & Verified Partner
          </span>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-2xl sm:text-3xl border-4 border-amber-400 shadow-xl shrink-0">
              {dealer.companyName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-black tracking-tight">{dealer.companyName}</h1>
              <p className="text-amber-400 text-sm font-semibold">Contact: {dealer.name}</p>
              {dealer.experienceYears && (
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <Award size={13} className="text-amber-500" /> {dealer.experienceYears} Experience
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Bar */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 -mt-8 relative z-10">
        <div className="bg-white grid sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <MapPin size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Address</p>
              <p className="text-xs sm:text-sm text-slate-800 font-semibold">{dealer.address ? dealer.address : `${dealer.area || ''}, ${dealer.city || ''}`}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4">
            <Phone size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Phone Call</p>
              <a href={`tel:${dealer.phone}`} className="text-xs sm:text-sm text-slate-900 font-bold hover:text-amber-600">
                {dealer.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4">
            <IndianRupee size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Base Rate</p>
              <p className="text-xs sm:text-sm text-amber-600 font-black">
                ₹{dealer.perKgPrice || 95} <span className="text-slate-400 font-normal">/ kg</span>
              </p>
            </div>
          </div>
        </div>

        {/* Primary Contact Actions */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <a 
            href={`tel:${dealer.phone}`} 
            className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-extrabold hover:bg-amber-400 transition text-sm shadow-md"
          >
            <Phone size={16} /> Direct Call: {dealer.phone}
          </a>
          {cleanPhone && (
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-extrabold hover:bg-emerald-500 transition text-sm shadow-md"
            >
              <MessageCircle size={16} /> WhatsApp Inquiry
            </a>
          )}
        </div>
      </section>

      {/* Estimator Calculator */}
      <Estimator dealerRate={dealer.perKgPrice} />

      {/* Quote Form */}
      <section className="py-16 bg-white border-t border-slate-200">
        <ContactForm dealerName={dealer.companyName} dealerEmail={dealer.email} />
      </section>
    </main>
  );
}