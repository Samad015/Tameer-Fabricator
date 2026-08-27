import React, { useState } from 'react';
import { Calculator, ArrowRight, IndianRupee, RefreshCw, Lock, Settings, Hand, FileText } from 'lucide-react';

export default function Estimator() {
  // Configured Rates
  const PRICE_PER_KG = 95; // Rate per kg (in Rupees)

  // State Management
  const [shutterType, setShutterType] = useState('manual'); // 'manual' or 'gear'
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);

  // Dynamic Density Based on Selected Shutter Type
  const weightPerSqFt = shutterType === 'manual' ? 2.2 : 2.6;

  const handleCalculate = (e) => {
    e.preventDefault();
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;

    const area = w * h;
    const weight = area * weightPerSqFt;
    const price = weight * PRICE_PER_KG;

    setResult({
      type: shutterType === 'manual' ? 'Manual Shutter' : 'Gear Shutter',
      totalSqFt: area,
      totalWeight: weight,
      estimatedPrice: price,
    });
  };

  // Calculations for Summary Table
  const shutterCost = result ? result.estimatedPrice : 0;
  const lockCost = 700;
  const gearCost = shutterType === 'gear' ? 5000 : 0;
  const finalTotal = shutterCost + lockCost + gearCost;

  return (
    <section id="estimator" className="py-20 bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide mb-4">
            <Calculator size={18} /> Instant Price Estimator
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Calculate Shutter Cost
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-2">
            Select shutter type and enter dimensions to get actual weight & estimated price.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="bg-slate-950 p-6 md:p-10 rounded-2xl border border-slate-800 shadow-2xl grid md:grid-cols-2 gap-8 items-start">
          
          {/* Inputs Section */}
          <form onSubmit={handleCalculate} className="space-y-4">
            
            {/* Shutter Type Selector Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">
                Select Shutter Type *
              </label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setShutterType('manual');
                    setResult(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    shutterType === 'manual'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Hand size={16} /> Manual (2.2 kg)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShutterType('gear');
                    setResult(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    shutterType === 'gear'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Settings size={16} /> Gear (2.6 kg)
                </button>
              </div>
            </div>

            {/* Customer Editable Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Width (Feet)
                </label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={width} 
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-bold"
                  placeholder="Enter width"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Height (Feet)
                </label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-bold"
                  placeholder="Enter height"
                />
              </div>
            </div>

            {/* Read-Only Fixed Rate & Dynamic Weight Cards */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                  Density (kg/sq.ft) <Lock size={12} className="text-slate-500" />
                </label>
                <input 
                  type="text" 
                  readOnly
                  disabled
                  value={`${weightPerSqFt} kg`}
                  className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-slate-400 font-bold cursor-not-allowed select-none"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                  Rate (₹ / kg) <Lock size={12} className="text-slate-500" />
                </label>
                <input 
                  type="text" 
                  readOnly
                  disabled
                  value={`₹${PRICE_PER_KG}`}
                  className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-slate-400 font-bold cursor-not-allowed select-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl transition text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-4 cursor-pointer"
            >
              <RefreshCw size={18} /> Calculate Estimate
            </button>
          </form>

          {/* Price & Specifications Output Display */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center flex flex-col justify-between min-h-[340px]">
            <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-slate-800 pb-3">
              Calculated Specifications
            </h3>

            {result ? (
              <div className="space-y-6 my-auto py-2">
                
                {/* Selected Type Badge */}
                <div className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {result.type}
                </div>

                <div className="grid grid-cols-2 gap-4 text-left bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 text-xs block font-medium">Total Area</span>
                    <span className="text-lg font-black text-slate-100">{result.totalSqFt.toFixed(2)} sq. ft.</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block font-medium">Approx Weight</span>
                    <span className="text-lg font-black text-amber-400">{result.totalWeight.toFixed(2)} kg</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-widest block mb-1 font-semibold">
                    Actual Shutter Price
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-amber-500 flex items-center justify-center gap-1">
                    <IndianRupee size={28} />
                    <span>
                      {result.estimatedPrice.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">*Included GST & installation charges basic rate</span>
                </div>

                <a 
                  href="#contact-form" 
                  className="inline-flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider border border-slate-700"
                >
                  Order Custom Shutter <ArrowRight size={16} />
                </a>
              </div>
            ) : (
              <div className="my-auto py-10 text-slate-500 text-sm space-y-2">
                <Calculator className="mx-auto text-slate-600 mb-2" size={40} />
                <p>Select shutter type, enter dimensions, and click <strong>"Calculate Estimate"</strong> to view exact weight & price.</p>
              </div>
            )}
          </div>

        </div>

        {/* Dynamic Cost Components Summary Section Below Calculator */}
        <div className="mt-10 bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <FileText size={18} className="text-amber-500" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              Cost Components Summary ({shutterType === 'manual' ? 'Manual Shutter' : 'Gear Shutter'})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm text-slate-300">
              <thead>
                <tr className="bg-slate-900 text-amber-500 uppercase font-extrabold border-b border-slate-800">
                  <th className="p-3">Component</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Amount / Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-white">Actual Shutter Price</td>
                  <td className="p-3 text-slate-400">Weight × Rate</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-400">
                    ₹{shutterCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {shutterType === 'gear' && (
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">Gear Charges</td>
                    <td className="p-3 text-slate-400">Fixed Charge</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">₹5,000.00</td>
                  </tr>
                )}

                <tr className="hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-white">Side Lock Charges</td>
                  <td className="p-3 text-slate-400">Fixed Charge</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-400">₹700.00</td>
                </tr>

                <tr className="bg-slate-900/80 font-black text-white text-sm sm:text-base border-t-2 border-slate-800">
                  <td className="p-3 text-amber-500">Final Rate / Total Estimate</td>
                  <td className="p-3 text-amber-500/80 text-xs font-normal">Calculated Total</td>
                  <td className="p-3 text-right font-mono text-amber-400 font-extrabold">
                    ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-400 italic bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
            * <strong className="text-amber-500 font-semibold">Excluded Freight Charge:</strong> Distance (km) × Per km Rate (e.g., ₹100/km)
          </p>
        </div>

      </div>
    </section>
  );
}