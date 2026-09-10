import React from 'react';
import { ShieldCheck, Wrench, Clock } from 'lucide-react';

export default function About() {
  return (
    <section
      id="about"
      className="py-20 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-amber-600 dark:text-amber-500 uppercase tracking-wide mb-4">
            Why Choose Tameer Fabricators?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed">
            At Tameer Fabricators, we design, manufacture, and install high-quality rolling shutters and custom steel structures built for maximum security, durability, and smooth daily operation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Wrench size={28} />,
              title: 'Custom Built',
              text: 'Precision-engineered to fit your exact measurements and site specifications.',
            },
            {
              icon: <ShieldCheck size={28} />,
              title: 'Maximum Durability',
              text: 'High-grade steel and materials designed to withstand heavy wear and harsh weather.',
            },
            {
              icon: <Clock size={28} />,
              title: 'Reliable Service',
              text: 'Fast installation, prompt maintenance, and reliable repairs to keep your operations secure.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-slate-100 dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-colors duration-300"
            >
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 text-amber-600 dark:text-amber-500">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {item.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
