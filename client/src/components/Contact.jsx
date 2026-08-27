import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import ContactForm from './ContactForm';

export default function Contact() {
  return (
    <section id="contact-form" className="py-20 bg-slate-900 text-white px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-amber-500 mb-4">
            Request a Free Quote
          </h2>
          <p className="text-slate-300 text-base md:text-lg">
            Get in touch with our expert team for custom rolling shutters and fabrication work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl">
          {/* Contact Info */}
          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Contact Details</h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-center gap-4">
                  <Phone className="text-amber-500 flex-shrink-0" size={24} />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-4">
                  <Mail className="text-amber-500 flex-shrink-0" size={24} />
                  <span>info@tameerfabricators.com</span>
                </li>
                <li className="flex items-center gap-4">
                  <MapPin className="text-amber-500 flex-shrink-0" size={24} />
                  <span>Industrial Area, Phase-2, City</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">
                ⚡ Fast response guaranteed within 24 working hours.
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}