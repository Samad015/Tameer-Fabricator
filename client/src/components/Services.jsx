import React from 'react';
import { services } from '../data/servicesData';
import { ImageOff } from 'lucide-react';

export default function Services() {
  return (
    <section id="services" className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-amber-500 uppercase tracking-wide">
            Our Fabrication Services
          </h2>
          <p className="text-slate-400 mt-2">
            Durable rolling shutter solutions designed for ultimate safety and performance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition duration-300 flex flex-col justify-between shadow-xl"
            >
              {/* Image Frame with Full Image Display */}
              <div className="w-full h-60 bg-slate-950 border-b border-slate-800 relative flex items-center justify-center p-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain rounded-lg transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
                
                {/* Fallback Display if Image Path is Wrong */}
                <div className="hidden absolute inset-0 flex-col items-center justify-center text-slate-500 bg-slate-900">
                  <ImageOff size={32} className="mb-1 text-slate-600" />
                  <span className="text-xs font-semibold">{item.title}</span>
                </div>
              </div>

              {/* Content Details */}
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-900 border border-slate-700 text-amber-500 px-2.5 py-1 rounded-md font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}