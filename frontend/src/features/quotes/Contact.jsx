import React from 'react';
import { PhoneCall, Ruler } from 'lucide-react';
import ContactForm from './ContactForm.jsx';

export default function Contact() {
  return (
    <section id="contact-form" aria-labelledby="quote-title" className="quote-section">
      <div className="mx-auto grid max-w-7xl items-start gap-9 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-24">
        <div className="lg:pt-8">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[.18em] text-[#fbbf24]">Workshop enquiries</p>
          <h2 id="quote-title">What are you<br />working on?</h2>
          <p className="mt-5 max-w-sm leading-relaxed text-[#cbd5e1]">Tell us about your shopfront, garage or workspace. We’ll call to discuss the right shutter for your opening.</p>
          <ul className="mt-7 grid gap-3 text-sm text-[#e2e8f0]">
            <li className="flex items-center gap-3"><PhoneCall size={17} /> Direct workshop callback</li>
            <li className="flex items-center gap-3"><Ruler size={17} /> Rough measurements welcome</li>
          </ul>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
