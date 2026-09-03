import React from 'react';
import { Mail, MapPin, ExternalLink ,  TvMinimalPlay, Clapperboard} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 ">
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
            
            <li className="flex items-center gap-2"><Mail size={18} className="text-amber-500" /> contact@tameerfabricators.com</li>

            <li className="flex items-center gap-2">
              < Clapperboard size={18} className="text-amber-500" />
              <a href="https://www.instagram.com/tameerfabricators?igsi=MWE5ZDlrN2R2YWJ4OQ==" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">Instagram</a>
            </li>

            <li className="flex items-center gap-2">
              <TvMinimalPlay size={18} className="text-amber-500" />
              <a href="https://youtube.com/@tameerfabricators?si=cw6a_s71E4WpwEqn" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">YouTube</a>
            </li>
            
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white mb-4">We are on</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <ExternalLink size={18} className="text-amber-500" /> 
              <a href="https://www.indiamart.com/tameer-fabricators-bareilly/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">IndiaMART Profile</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 border-t border-slate-800/80 mt-10 pt-6">
        © {new Date().getFullYear()} Tameer Fabricator's. All rights reserved.
      </div>
    </footer>
  );
}