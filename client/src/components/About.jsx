import React from 'react';
import { ShieldCheck, Wrench, Clock } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-20 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-amber-500 uppercase tracking-wide mb-4">
            Why Choose Tameer Fabricators?
          </h2>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            At Tameer Fabricators, we design, manufacture, and install high-quality rolling shutters and custom steel structures built for maximum security, durability, and smooth daily operation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 text-amber-500">
              <Wrench size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Custom Built</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Precision-engineered to fit your exact measurements and site specifications.
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 text-amber-500">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Maximum Durability</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              High-grade steel and materials designed to withstand heavy wear and harsh weather.
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 text-amber-500">
              <Clock size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Reliable Service</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Fast installation, prompt maintenance, and reliable repairs to keep your operations secure.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}