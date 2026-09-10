import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle, Calculator, ArrowRight, IndianRupee, RefreshCw, Lock, Settings, Hand, FileText, Blinds, Cog, Building, Ruler, ChevronDown, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const HERO_IMAGE = "/images/dealer-hero.jpeg";

function Estimator() {
  // Configured Rates
  const PRICE_PER_KG = 95; // Rate per kg (in Rupees)
  const INCHES_TO_FEET = 1 / 12; // Conversion factor: 1 inch = 1/12 feet

  // State Management
  const [shutterType, setShutterType] = useState('manual'); // 'manual' or 'gear'
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);

  // Unit Selection State (Feet / Inches)
  const [unit, setUnit] = useState('feet'); // 'feet' or 'inches'
  const [showUnitPopup, setShowUnitPopup] = useState(false);

  // Dynamic Density Based on Selected Shutter Type
  const weightPerSqFt = shutterType === 'manual' ? 2.2 : 2.6;

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
    <section id="estimator" className="py-20 bg-white text-slate-900 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-600 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide mb-4">
            <Calculator size={18} /> Instant Price Estimator
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
            Calculate Shutter Cost
          </h2>
          <p className="text-slate-500 text-sm md:text-base mt-2">
            Select shutter type and enter dimensions to get actual weight & estimated price.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="bg-slate-50 p-6 md:p-10 rounded-2xl border border-slate-200 shadow-xl grid md:grid-cols-2 gap-8 items-start">
          
          {/* Inputs Section */}
          <form onSubmit={handleCalculate} className="space-y-4">
            
            {/* Shutter Type Selector Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                Select Shutter Type *
              </label>
              <div className="grid grid-cols-3 gap-3 p-1.5 bg-white border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setShutterType('manual');
                    setResult(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    shutterType === 'manual'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Hand size={16} /> Manual 
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShutterType('gear');
                    setResult(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    shutterType === 'gear'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Cog size={16} /> Gear 
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShutterType('motorized');
                    setResult(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    shutterType === 'motorized'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Building size={16} /> Motorized 
                </button>
              </div>
            </div>

            {/* Unit Selector Popup (Feet / Inches) - NEW FEATURE */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                Select Unit *
              </label>
              <button
                type="button"
                onClick={() => setShowUnitPopup(!showUnitPopup)}
                className="w-full flex items-center justify-between gap-2 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold hover:border-amber-500 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Ruler size={16} className="text-amber-500" />
                  {unit === 'feet' ? 'Feet (ft)' : 'Inches (in)'}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showUnitPopup ? 'rotate-180' : ''}`} />
              </button>

              {showUnitPopup && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setUnit('feet');
                      setShowUnitPopup(false);
                      setResult(null);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-sm font-bold transition cursor-pointer ${
                      unit === 'feet' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Feet (ft)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUnit('inches');
                      setShowUnitPopup(false);
                      setResult(null);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-sm font-bold transition cursor-pointer ${
                      unit === 'inches' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Inches (in)
                  </button>
                </div>
              )}
            </div>

            {/* Customer Editable Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
                  Width (Feet)
                </label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={width} 
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                  placeholder="Enter width"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
                  Height (Feet)
                </label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                  placeholder="Enter height"
                />
              </div>
            </div>

            {/* Read-Only Fixed Rate & Dynamic Weight Cards */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                  Density (kg/sq.ft) <Lock size={12} className="text-slate-400" />
                </label>
                <input 
                  type="text" 
                  readOnly
                  disabled
                  value={`${weightPerSqFt} kg`}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-500 font-bold cursor-not-allowed select-none"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                  Rate (₹ / kg) <Lock size={12} className="text-slate-400" />
                </label>
                <input 
                  type="text" 
                  readOnly
                  disabled
                  value={`₹${PRICE_PER_KG}`}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-500 font-bold cursor-not-allowed select-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black py-3.5 rounded-xl transition text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-4 cursor-pointer"
            >
              <RefreshCw size={18} /> Calculate Estimate
            </button>
          </form>

          {/* Price & Specifications Output Display */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center flex flex-col justify-between min-h-[340px]">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200 pb-3">
              Calculated Specifications
            </h3>

            {result ? (
              <div className="space-y-6 my-auto py-2">
                
                {/* Selected Type Badge */}
                <div className="inline-block bg-amber-50 border border-amber-300 text-amber-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {result.type}
                </div>

                <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">Total Area</span>
                    <span className="text-lg font-black text-slate-900">{result.totalSqFt.toFixed(2)} sq. ft.</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">Approx Weight</span>
                    <span className="text-lg font-black text-amber-600">{result.totalWeight.toFixed(2)} kg</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-xs uppercase tracking-widest block mb-1 font-semibold">
                    Actual Shutter Price
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-amber-600 flex items-center justify-center gap-1">
                    <IndianRupee size={28} />
                    <span>
                      {result.estimatedPrice.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">*Included GST & installation charges basic rate</span>
                </div>

                <a 
                  href="#contact-form" 
                  className="inline-flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-800 font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider border border-slate-200"
                >
                  Order Custom Shutter <ArrowRight size={16} />
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

        {/* Dynamic Cost Components Summary Section Below Calculator */}
        <div className="mt-10 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
            <FileText size={18} className="text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
              Cost Components Summary ({shutterType === 'manual' ? 'Manual Shutter' : shutterType === 'gear' ? 'Gear Shutter' : 'Motorized Shutter'})
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
                  <td className="p-3 text-slate-500">Weight × Rate</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-600">
                    ₹{shutterCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {shutterType === 'gear' && (
                  <tr className="hover:bg-white">
                    <td className="p-3 font-semibold text-slate-900">Gear Charges</td>
                    <td className="p-3 text-slate-500">Fixed Charge</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-600">₹5,000.00</td>
                  </tr>
                )}

                {shutterType === 'motorized' && (
                  <tr className="hover:bg-white">
                    <td className="p-3 font-semibold text-slate-900">Motor Charges</td>
                    <td className="p-3 text-slate-500">Fixed Charge</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-600">₹30,000.00</td>
                  </tr>
                )}

                <tr className="hover:bg-white">
                  <td className="p-3 font-semibold text-slate-900">Side Lock Charges</td>
                  <td className="p-3 text-slate-500">Fixed Charge</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-600">₹700.00</td>
                </tr>

                <tr className="bg-white font-black text-slate-900 text-sm sm:text-base border-t-2 border-slate-200">
                  <td className="p-3 text-amber-600">Final Rate / Total Estimate</td>
                  <td className="p-3 text-amber-600/70 text-xs font-normal">Calculated Total</td>
                  <td className="p-3 text-right font-mono text-amber-600 font-extrabold">
                    ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-200">
            * <strong className="text-amber-600 font-semibold">Excluded Freight Charge:</strong> Distance (km) × Per km Rate (e.g., ₹50/km)
          </p>
        </div>

      </div>
    </section>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    width: "",
    height: "",
    unit: "Feet",
    shutterType: "",
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

  const handleShutterSelect = (type) => {
    setFormData({
      ...formData,
      shutterType: type,
    });
    setShowShutterPopup(false);
  };

  const handleUnitSelect = (unitValue) => {
    setFormData({
      ...formData,
      unit: unitValue,
    });
    setShowUnitPopup(false);
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
        body: JSON.stringify(formData),
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
          shutterType: "",
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
        message:
          "Server error! Please check if backend is running on port 5001.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="contact-form" className="space-y-3 max-w-md mx-auto">
      {status.message && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 text-xs font-semibold ${
            status.type === "success"
              ? "bg-emerald-50 border border-emerald-300 text-emerald-600"
              : "bg-rose-50 border border-rose-300 text-rose-600"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-700">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-700">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 00000 00000"
            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-700">
            Width (in ft)
          </label>
          <input
            type="number"
            name="width"
            value={formData.width}
            onChange={handleChange}
            placeholder="e.g. 10"
            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-700">
            Height (in ft)
          </label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="e.g. 8"
            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Unit Selection (Feet / Inches) - NEW FIELD ADDED FOR EMAIL DATA */}
      <div>
        <label className="block text-xs font-semibold mb-1 text-slate-700">
          Unit
        </label>
        <button
          type="button"
          onClick={() => setShowUnitPopup(true)}
          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-left text-slate-900 focus:outline-none focus:border-amber-500 transition hover:border-amber-500 cursor-pointer flex items-center gap-2"
        >
          <Ruler size={14} className="text-amber-500" />
          {formData.unit}
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1 text-slate-700">
          Shutter Type
        </label>
        <button
          type="button"
          onClick={() => setShowShutterPopup(true)}
          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-left text-slate-900 focus:outline-none focus:border-amber-500 transition hover:border-amber-500 cursor-pointer"
        >
          {formData.shutterType ? formData.shutterType : "Select Shutter Type"}
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1 text-slate-700">
          Requirements / Project Specs
        </label>
        <textarea
          name="message"
          rows="3"
          value={formData.message}
          onChange={handleChange}
          placeholder="Describe your requirement..."
          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 transition resize-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 text-white font-black py-2.5 rounded-lg hover:bg-amber-400 transition text-sm flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <Send size={16} /> Submit Quote Request
          </>
        )}
      </button>

      {showShutterPopup && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShutterPopup(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl p-4 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Select Shutter Type
            </h3>
            <div className="space-y-2">
              {["Manual", "Gear", "Motorized"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleShutterSelect(type)}
                  className={`w-full text-left p-2 text-sm rounded-lg border transition cursor-pointer ${
                    formData.shutterType === type
                      ? "bg-amber-500 border-amber-500 text-white font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowShutterPopup(false)}
              className="w-full mt-3 p-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:border-amber-500 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Unit Selection Popup - NEW POPUP ADDED */}
      {showUnitPopup && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUnitPopup(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl p-4 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Select Unit
            </h3>
            <div className="space-y-2">
              {["Feet", "Inches"].map((unitOption) => (
                <button
                  key={unitOption}
                  type="button"
                  onClick={() => handleUnitSelect(unitOption)}
                  className={`w-full text-left p-2 text-sm rounded-lg border transition cursor-pointer ${
                    formData.unit === unitOption
                      ? "bg-amber-500 border-amber-500 text-white font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-500"
                  }`}
                >
                  {unitOption}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowUnitPopup(false)}
              className="w-full mt-3 p-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:border-amber-500 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </form>
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
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading dealer profile...</div>;
  }

  if (!dealer) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Dealer not found.</div>;
  }

  const whatsappNumber = dealer.phone ? dealer.phone.replace(/[^\d]/g, "") : "";

  return (
    <main className="bg-white min-h-screen">
      {/* Hero section */}
      <section className="relative h-[380px] sm:h-[440px] overflow-hidden">
        <img src={HERO_IMAGE} alt="Installation" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="relative h-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-8">
          <p className="text-amber-500 text-2xl sm:text-3xl font-black max-w-sm drop-shadow-md">
            {dealer.companyName} - Rolling Shutters & Metal Fabrication Experts
          </p>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black text-2xl border-4 border-amber-400 shadow-lg">
              {dealer.companyName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-white text-xl sm:text-2xl font-black">{dealer.companyName}</h1>
              <p className="text-amber-400 text-sm font-semibold">Owner: {dealer.name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact bar */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <MapPin size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-slate-400 font-semibold">Address</p>
              <p className="text-sm text-slate-800 font-medium">{dealer.address}, Area: {dealer.area}, {dealer.city}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4">
            <Phone size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-slate-400 font-semibold">Phone</p>
              <a href={`tel:${dealer.phone}`} className="text-sm text-slate-800 font-medium hover:text-amber-600">
                {dealer.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4">
            <Mail size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-slate-400 font-semibold">Email</p>
              <a href={`mailto:${dealer.email}`} className="text-sm text-slate-800 font-medium hover:text-amber-600 break-all">
                {dealer.email}
              </a>
            </div>
          </div>
        </div>

        {/* Primary actions */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <a href={`tel:${dealer.phone}`} className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3 rounded-lg font-bold hover:bg-amber-400 transition">
            <Phone size={18} /> Call Dealer
          </a>
          {whatsappNumber && (
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-500 transition">
              <MessageCircle size={18} /> WhatsApp
            </a>
          )}

          
        </div>
      </section>

      {/* Price Estimator */}
      <Estimator />

      {/* Contact Form */}
      <ContactForm />
    </main>
  );
}