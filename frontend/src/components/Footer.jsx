import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, MapPin, ExternalLink, TvMinimalPlay, Clapperboard, MessageCircle } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  const isDealerPage = location.pathname.startsWith('/dealer');
  const dealerId = isDealerPage ? location.pathname.split('/')[2] : null;

  const [dealer, setDealer] = useState(null);

  useEffect(() => {
    if (!dealerId) return;

    const fetchDealer = async () => {
      try {
        const res = await fetch(`/api/dealers/${dealerId}`);
        const data = await res.json();
        if (data.success) {
          setDealer(data.dealer);
        }
      } catch (err) {
        console.error('Error fetching dealer for footer:', err);
      }
    };

    fetchDealer();
  }, [dealerId]);

  const whatsappNumber = dealer?.phone ? dealer.phone.replace(/[^\d]/g, '') : '';

  /* ---------------------------------------------------------- */
  /*  Original footer for the rest of the site                   */
  /* ---------------------------------------------------------- */
  return (
    <footer className="bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 py-12 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 ">
        <div>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-500 uppercase mb-4">Tameer Fabricator's</h3>
          <p className="text-sm leading-relaxed">
            Leading experts in motorized and manual rolling shutters, custom iron fabrication, and industrial security solutions.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Contact Details</h4>
          <ul className="space-y-3 text-sm">
            {isDealerPage ? (
              <>
                {dealer?.phone && (
                  <li className="flex items-center gap-2">
                    <MessageCircle size={18} className="text-amber-500" />
                    <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">{dealer.phone}</a>
                  </li>
                )}
                {dealer?.email && (
                  <li className="flex items-center gap-2">
                    <Mail size={18} className="text-amber-500" />
                    <a href={`mailto:${dealer.email}`} className="hover:text-amber-500 transition break-all">{dealer.email}</a>
                  </li>
                )}
                {dealer?.address && (
                  <li className="flex items-center gap-2">
                    <MapPin size={18} className="text-amber-500" /> {dealer.address}, {dealer.area}, {dealer.city}
                  </li>
                )}
              </>
            ) : (
              <>
                <li className="flex items-center gap-2"><MapPin size={18} className="text-amber-500" /> Bareilly, Uttar Pradesh, India</li>

                <li className="flex items-center gap-2"><Mail size={18} className="text-amber-500" /> contact@tameerfabricators.com</li>

                <li className="flex items-center gap-2">
                  <Clapperboard size={18} className="text-amber-500" />
                  <a href="https://www.instagram.com/tameerfabricators?igsi=MWE5ZDlrN2R2YWJ4OQ==" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">Instagram</a>
                </li>
              </>
            )}
          </ul>
        </div>

        {!isDealerPage && (
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">We are on</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <ExternalLink size={18} className="text-amber-500" />
                <a href="https://www.indiamart.com/tameer-fabricators-bareilly/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">IndiaMART Profile</a>
              </li>

              <li className="flex items-center gap-2">
                <TvMinimalPlay size={18} className="text-amber-500" />
                <a href="https://youtube.com/@tameerfabricators?si=cw6a_s71E4WpwEqn" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">YouTube</a>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800/80 mt-10 pt-6">
        © {new Date().getFullYear()} Tameer Fabricator's. All rights reserved.
      </div>
    </footer>
  );
}
