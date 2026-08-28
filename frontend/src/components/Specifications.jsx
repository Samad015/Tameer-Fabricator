import React from 'react';
import { Layers } from 'lucide-react';

export default function Specifications() {
  const specsData = [
    {
      name: 'GI Sheet Strip',
      material: 'Galvanized Iron',
      dimension: 'Custom Strip Width',
      thickness: '0.08 mm (Ultra-Thin Foil)',
      weight: '~0.63 g/m²',
      application: 'Precision Shims / Insulation Wrapping',
    },
    {
      name: '10 Gauge MS Flat',
      material: 'Mild Steel',
      dimension: '6 in (152.4 mm) Width',
      thickness: '10 Gauge (~3.42 mm / 0.135")',
      weight: '~4.09 kg/m (~1.25 kg/ft)',
      application: 'Heavy Duty Base Plates / Structural Support',
    },
    {
      name: '10 Gauge MS Pipe',
      material: 'Mild Steel',
      dimension: '1.5 in (38.1 mm) NB/OD',
      thickness: '10 Gauge (~3.42 mm / 0.135")',
      weight: '~2.93 kg/m (~0.89 kg/ft)',
      application: 'Structural Piping / Frame Fabrication',
    },
    {
      name: 'MS Flat Bar (32x6)',
      material: 'Mild Steel',
      dimension: '32 mm Width',
      thickness: '6.0 mm Thickness',
      weight: '~1.51 kg/m (0.46 kg/ft)',
      application: 'Bracing, Grills, Engineering',
    },
    {
      name: 'MS Equal Angle (35x5)',
      material: 'Mild Steel',
      dimension: '35 x 35 mm Sides',
      thickness: '5.0 mm Thickness',
      weight: '~2.60 kg/m (0.79 kg/ft)',
      application: 'Structural Framing / Truss Supports',
    },
  ];

  return (
    <section id="specifications" className="py-20 bg-slate-950 text-white px-4 border-t border-b border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers size={14} /> Material Standards
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
            Steel Product <span className="text-amber-500">Specifications</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mt-3">
            Technical product specifications master chart for structural and fabrication planning.
          </p>
        </div>

        {/* Data Table Container */}
        <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-amber-500 uppercase text-xs sm:text-sm font-extrabold tracking-wider border-b border-slate-700">
                <th className="p-4">Product Name</th>
                <th className="p-4">Material Type</th>
                <th className="p-4">Dimension / Size</th>
                <th className="p-4">Standard Thickness</th>
                <th className="p-4">Theoretical Weight</th>
                <th className="p-4">Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs sm:text-sm text-slate-300">
              {specsData.map((item, index) => (
                <tr key={index} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-bold text-white whitespace-nowrap">{item.name}</td>
                  <td className="p-4 whitespace-nowrap">{item.material}</td>
                  <td className="p-4 whitespace-nowrap">{item.dimension}</td>
                  <td className="p-4 whitespace-nowrap text-amber-400 font-medium">{item.thickness}</td>
                  <td className="p-4 whitespace-nowrap font-mono">{item.weight}</td>
                  <td className="p-4">{item.application}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}