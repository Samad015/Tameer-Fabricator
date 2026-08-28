import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-black text-amber-500 uppercase mb-4">Tameer Fabricator's</h3>
          <p className="text-sm leading-relaxed">
            Leading experts in motorized and manual rolling shutters, custom iron fabrication, and industrial security solutions.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white mb-4">Contact Details</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><MapPin size={18} className="text-amber-500" /> Bareilly, Uttar Pradesh, India</li>
            <li className="flex items-center gap-2">
              <Phone size={18} className="text-amber-500" /> 
              <a href="tel:+918439860719" className="hover:text-amber-500 transition">+91 84398 60719</a>
            </li>
            <li className="flex items-center gap-2"><Mail size={18} className="text-amber-500" /> contact@tameerfabricators.com</li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white mb-4">Quick Contact</h4>
          <div className="flex gap-4 text-sm font-semibold">
            <a href="tel:+918439860719" className="hover:text-amber-500 transition">Direct Call</a>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 border-t border-slate-800/80 mt-10 pt-6">
        © {new Date().getFullYear()} Tameer Fabricator's. All rights reserved.
      </div>
    </footer>
  );
}