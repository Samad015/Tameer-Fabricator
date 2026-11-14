import { useEstimate } from './useEstimate.js';
import { apiFetch } from '../../shared/api.js';
import { kgPerSquareFoot } from './weight.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  ArrowRight,
  IndianRupee,
  RefreshCw,
  Lock,
  FileText,
  Hand,
  Building,
  Ruler,
  ChevronDown,
  MapPin,
  Loader2,
  Cog
} from 'lucide-react';

export default function Estimator() {
  const navigate = useNavigate();
  const DEFAULT_PRICE_PER_KG = 95; 


  const [shutterType, setShutterType] = useState('manual');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');


  const [currentPricePerKg, setCurrentPricePerKg] = useState(DEFAULT_PRICE_PER_KG);
  const [dealerInfo, setDealerInfo] = useState(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rateSourceMessage, setRateSourceMessage] = useState('Indicative price');

  const [unit, setUnit] = useState('feet');
  const [showUnitPopup, setShowUnitPopup] = useState(false);
  const {result,setResult,calculating,calculationError,calculateEstimate} = useEstimate({width,height,unit,shutterType,rate:currentPricePerKg});

  const getApiBaseUrl = () => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

  const rateRequest = useRef(null);

  const fetchDealerRate = async () => {
    rateRequest.current?.abort();
    const controller = new AbortController();
    rateRequest.current = controller;
    setResult(null);
    setCurrentPricePerKg(DEFAULT_PRICE_PER_KG);
    setDealerInfo(null);
    const selectedLocation = localStorage.getItem('userCity') || localStorage.getItem('userLocationName')?.split(',')[0] || 'Bareilly';

    setIsLoadingRate(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await apiFetch(`${baseUrl}/api/dealers/search?location=${encodeURIComponent(selectedLocation)}`, { signal: controller.signal });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok || !data.success) throw new Error(data.message || "Pricing unavailable");
      setRateSourceMessage(`Indicative rate for ${selectedLocation}`);

      if (data.success && data.dealers && data.dealers.length > 0) {
        const activeDealer = data.dealers.slice(0,5).find(dealer => Number.isFinite(Number(dealer.perKgPrice)) && Number(dealer.perKgPrice) > 0);
        if (Number.isFinite(Number(activeDealer?.perKgPrice)) && Number(activeDealer?.perKgPrice) > 0) {
          setCurrentPricePerKg(activeDealer.perKgPrice);
          setDealerInfo(activeDealer);
          setRateSourceMessage(`Live Rate from ${activeDealer.companyName || activeDealer.name} (${activeDealer.area || activeDealer.city}) - ₹${activeDealer.perKgPrice}/kg`);
        }
      } else {
        setCurrentPricePerKg(DEFAULT_PRICE_PER_KG);
        setDealerInfo(null);
        setRateSourceMessage(`Indicative rate for ${selectedLocation}`);
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error('Error fetching dealer pricing:', error);
      setCurrentPricePerKg(DEFAULT_PRICE_PER_KG);
      setDealerInfo(null);
      setRateSourceMessage('Indicative price — local pricing is unavailable');
    } finally {
      if (!controller.signal.aborted) setIsLoadingRate(false);
    }
  };

  useEffect(() => {
    fetchDealerRate();

    window.addEventListener('cityChanged', fetchDealerRate);
    window.addEventListener('storage', fetchDealerRate);

    return () => {
      rateRequest.current?.abort();
      window.removeEventListener('cityChanged', fetchDealerRate);
      window.removeEventListener('storage', fetchDealerRate);
    };
  }, []);

  const weightPerSqFt = kgPerSquareFoot(shutterType);

  const handleCalculate = calculateEstimate;

  // Navigate to the matched local dealer's profile page.
  // If no dealer was found for the customer's location, send them
  // to the dealer search/dashboard page so they can find one manually.
  const handleOrderCustomShutter = () => {
    if (dealerInfo && dealerInfo._id) {
      navigate(`/dealer/${dealerInfo._id}`);
    } else {
      navigate('/dashboard');
    }
  };

  const shutterCost = result ? result.estimatedPrice : 0;
  const lockCost = 700;
  const gearCost = shutterType === 'gear' ? 5000 : 0;
  const motorCost = shutterType === 'motorized' ? 30000 : 0;
  const finalTotal = shutterCost + lockCost + gearCost + motorCost;

  return (
    <section id="estimator" className="py-20 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-500 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide mb-4">
            <Calculator size={18} /> A helpful starting point
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            What might your shutter cost?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-2">
            Choose a shutter and add your measurements for an approximate price. Your fabricator will confirm the final quote.
          </p>
          
          <div className="mt-4 inline-flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs text-slate-300 shadow-md">
            <MapPin size={14} className="text-amber-500" />
            {isLoadingRate ? (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Loader2 size={12} className="animate-spin text-amber-500" /> Checking local pricing…
              </span>
            ) : (
              <span>
                <strong className="text-amber-400">{rateSourceMessage}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Calculator Main Box */}
        <div className="bg-white dark:bg-slate-950 p-6 md:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl grid md:grid-cols-2 gap-8 items-start">
          
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase">
                Select Shutter Type *
              </label>
              <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setShutterType('manual'); setResult(null); }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    shutterType === 'manual'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Hand size={16} /> Manual 
                </button>
                <button
                  type="button"
                  onClick={() => { setShutterType('gear'); setResult(null); }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    shutterType === 'gear'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Cog size={16} /> Gear 
                </button>
                <button
                  type="button"
                  onClick={() => { setShutterType('motorized'); setResult(null); }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    shutterType === 'motorized'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building size={16} /> Motorized 
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase">
                Select Unit *
              </label>
              <button
                type="button"
                onClick={() => setShowUnitPopup(!showUnitPopup)}
                className="w-full flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-bold hover:border-amber-500 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Ruler size={16} className="text-amber-500" />
                  {unit === 'feet' ? 'Feet (ft)' : 'Inches (in)'}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showUnitPopup ? 'rotate-180' : ''}`} />
              </button>

              {showUnitPopup && (
                <div className="absolute z-20 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setUnit('feet'); setShowUnitPopup(false); setResult(null); }}
                    className={`w-full text-left px-3.5 py-2.5 text-sm font-bold transition cursor-pointer ${
                      unit === 'feet' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Feet (ft)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUnit('inches'); setShowUnitPopup(false); setResult(null); }}
                    className={`w-full text-left px-3.5 py-2.5 text-sm font-bold transition cursor-pointer ${
                      unit === 'inches' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Inches (in)
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase">
                  Width ({unit === 'feet' ? 'Feet' : 'Inches'})
                </label>
                <input 
                  type="number" 
                  step="any"
                  min="0.01"
                  max="10000"
                  required
                  value={width} 
                  onChange={(e) => { setWidth(e.target.value); setResult(null); }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold"
                  placeholder="Enter width"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase">
                  Height ({unit === 'feet' ? 'Feet' : 'Inches'})
                </label>
                <input 
                  type="number" 
                  step="any"
                  min="0.01"
                  max="10000"
                  required
                  value={height} 
                  onChange={(e) => { setHeight(e.target.value); setResult(null); }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold"
                  placeholder="Enter height"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Density (kg/sq.ft) <Lock size={12} className="text-slate-400 dark:text-slate-500" />
                </label>
                <input 
                  type="text" 
                  readOnly
                  disabled
                  value={`${weightPerSqFt} kg`}
                  className="w-full bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3.5 py-2.5 text-slate-500 dark:text-slate-400 font-bold cursor-not-allowed select-none"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Rate (₹ / kg) <Lock size={12} className="text-slate-400 dark:text-slate-500" />
                </label>
                <input 
                  type="text" 
                  readOnly
                  disabled
                  value={`₹${currentPricePerKg}`}
                  className="w-full bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3.5 py-2.5 text-slate-500 dark:text-slate-400 font-bold cursor-not-allowed select-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoadingRate || calculating}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl transition text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-4 cursor-pointer"
            >
              <RefreshCw size={18} /> {calculating ? 'Calculating…' : 'Calculate Estimate'}
            </button>
            {calculationError && <p role="alert" className="text-red-700 text-sm">{calculationError}</p>}
          </form>

          {/* Price & Specifications Output Display */}
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between min-h-[340px]">
            <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-slate-200 dark:border-slate-800 pb-3">
              Calculated Specifications
            </h3>

            {result ? (
              <div className="space-y-6 my-auto py-2">
                
                {/* Selected Type Badge */}
                <div className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {result.type}
                </div>

                <div className="grid grid-cols-2 gap-4 text-left bg-white dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs block font-medium">Total Area</span>
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">{result.totalSqFt.toFixed(2)} sq. ft.</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs block font-medium">Approx Weight</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">{result.totalWeight.toFixed(2)} kg</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest block mb-1 font-semibold">
                    Estimated Shutter Price
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-500 flex items-center justify-center gap-1">
                    <IndianRupee size={28} />
                    <span>
                      {result.estimatedPrice.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">*Confirm GST and installation charges with your fabricator.</span>
                </div>

                <button
                  type="button"
                  onClick={handleOrderCustomShutter}
                  className="inline-flex items-center justify-center gap-2 w-full bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-900 dark:text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  {dealerInfo ? `Order from ${dealerInfo.companyName || dealerInfo.name}` : 'Find a Local Dealer'} <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="my-auto py-10 text-slate-500 text-sm space-y-2">
                <Calculator className="mx-auto text-slate-400 dark:text-slate-600 mb-2" size={40} />
                <p>Select shutter type, enter dimensions, and click <strong>"Calculate Estimate"</strong> to view approximate weight & price.</p>
              </div>
            )}
          </div>

        </div>

        {/* Dynamic Cost Components Summary Section Below Calculator */}
        <div className="mt-10 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            <FileText size={18} className="text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Cost Components Summary ({shutterType === 'manual' ? 'Manual Shutter' : shutterType === 'gear' ? 'Gear Shutter' : 'Motorized Shutter'})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 text-amber-600 dark:text-amber-500 uppercase font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Component</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Amount / Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Estimated Shutter Price</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">Weight × Rate</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                    ₹{shutterCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {shutterType === 'gear' && (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Gear Charges</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">Fixed Charge</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">₹5,000.00</td>
                  </tr>
                )}

                {shutterType === 'motorized' && (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Motor Charges</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">Fixed Charge</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">₹30,000.00</td>
                  </tr>
                )}

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Side Lock Charges</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">Fixed Charge</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">₹700.00</td>
                </tr>

                <tr className="bg-slate-100 dark:bg-slate-900/80 font-black text-slate-900 dark:text-white text-sm sm:text-base border-t-2 border-slate-200 dark:border-slate-800">
                  <td className="p-3 text-amber-600 dark:text-amber-500">Final Rate / Total Estimate</td>
                  <td className="p-3 text-amber-600/80 dark:text-amber-500/80 text-xs font-normal">Calculated Total</td>
                  <td className="p-3 text-right font-mono text-amber-600 dark:text-amber-400 font-extrabold">
                    {result ? `₹${finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 italic bg-slate-100/70 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
            * <strong className="text-amber-600 dark:text-amber-500 font-semibold">Excluded Freight Charge:</strong> Distance (km) × Per km Rate (e.g., ₹50/km)
          </p>
        </div>

      </div>
    </section>
  );
}