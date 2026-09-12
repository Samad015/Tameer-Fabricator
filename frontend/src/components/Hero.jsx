
import React from 'react';
import { ShieldCheck, Wrench, Clock, Calculator, Store } from 'lucide-react';

export default function Hero() {
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-[90vh] flex flex-col justify-between items-center overflow-hidden py-12 px-4 transition-colors duration-300">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-bg.jpg"
          alt="Tameer Fabricators Banner"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-transparent dark:bg-slate-950/25"></div>
        <div className="absolute inset-0 bg-linear-to-t from-transparent via-transparent to-transparent dark:from-slate-950 dark:via-slate-950/10 dark:to-slate-950/40"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10 my-auto">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight text-slate-950 dark:text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
          Heavy-Duty Rolling Shutters &{' '}
          <span className="text-amber-600 dark:text-amber-500">
            Metal Fabrication
          </span>{' '}
          Built to Protect Your Business
        </h1>

        <div className="max-w-3xl mx-auto mb-8 space-y-3">
          <p className="text-base sm:text-lg md:text-xl text-white dark:text-white font-bold leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            At Tameer Fabricators, we design, manufacture, and install high-quality rolling shutters and custom steel structures built for maximum security, durability, and smooth daily operation.
          </p>
          <p className="text-sm sm:text-base text-white dark:text-white font-semibold leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Whether you need commercial rolling shutters, industrial security gates, or specialized metal fabrication, our expert team delivers precision engineering tailored to your site specifications.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <a
            href="#estimator"
            onClick={(e) => scrollToSection(e, 'estimator')}
            className="group relative overflow-hidden bg-linear-to-r from-orange-500 via-amber-500 to-yellow-400 text-slate-950 px-8 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl shadow-amber-500/40 uppercase tracking-wide cursor-pointer border-2 border-yellow-300/70 animate-pulse hover:animate-none hover:scale-105 hover:shadow-amber-400/70 transition-all duration-300"
          >
            <Calculator size={22} /> Calculate Price
          </a>

          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, 'contact-form')}
            className="group relative overflow-hidden bg-white from-orange-500 via-amber-500 to-yellow-400 text-slate-950 px-8 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl shadow-amber-500/40 uppercase tracking-wide cursor-pointer border-2 border-yellow-300/70 animate-pulse hover:animate-none hover:scale-105 hover:shadow-amber-400/70 transition-all duration-300"
          >
            Request a Free Quote
          </a>

          {/* START SELLING BUTTON */}
          <a
            href="/register"
            className="group relative overflow-hidden bg-linear-to-r from-orange-500 via-amber-500 to-yellow-400 text-slate-950 px-8 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl shadow-amber-500/40 uppercase tracking-wide cursor-pointer border-2 border-yellow-300/70 animate-pulse hover:animate-none hover:scale-105 hover:shadow-amber-400/70 transition-all duration-300"
          >
            <span className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></span>

            <Store size={22} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />

            <span className="relative z-10">
              START SELLING
            </span>

            <span className="absolute top-1 right-2 h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            [Wrench, 'Custom Built', 'Precision-engineered to fit your exact measurements and requirements.'],
            [ShieldCheck, 'Maximum Durability', 'High-grade steel and materials designed to withstand heavy wear and harsh weather.'],
            [Clock, 'Reliable Service', 'Fast installation, prompt maintenance, and reliable repairs to keep your operations secure.'],
          ].map(([Icon, title, text]) => (
            <div
              key={title}
              className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md p-6 rounded-2xl border border-slate-300/70 dark:border-slate-700/60 shadow-2xl flex items-start gap-4 text-left"
            >
              <Icon className="text-amber-600 dark:text-amber-500 shrink-0 mt-1" size={32} />
              <div>
                <h3 className="font-extrabold text-slate-950 dark:text-white text-lg md:text-xl">{title}</h3>
                <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base mt-1.5 leading-normal">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}