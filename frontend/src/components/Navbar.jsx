import React, { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Round Logo Section */}
          <a href="#" className="flex items-center gap-3 group">
            <img 
              src="/images/logo.jpg" 
              alt="Tameer Fabricator's Logo" 
              className="h-14 w-14 object-cover rounded-full border-2 border-amber-500 shadow-md"
            />
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-500 font-semibold leading-none mb-1">
                Welcome to
              </span>
              <span className="text-lg sm:text-xl font-black text-white tracking-wide uppercase leading-none">
                Tameer Fabricator's
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center font-medium">
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-amber-500 transition">About</a>
            <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="hover:text-amber-500 transition">Services</a>
            <a href="#specifications" onClick={(e) => scrollToSection(e, 'specifications')} className="hover:text-amber-500 transition">Specifications</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact-form')} className="hover:text-amber-500 transition">Contact</a>
            <a 
              href="tel:+918439860719" 
              className="bg-amber-500 text-slate-950 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-400 transition"
            >
              <Phone size={18} /> Call Now
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-200">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 px-4 pt-2 pb-6 space-y-3 border-b border-slate-800">
          <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="block py-2 text-slate-300 hover:text-amber-500">About</a>
          <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="block py-2 text-slate-300 hover:text-amber-500">Services</a>
          <a href="#specifications" onClick={(e) => scrollToSection(e, 'specifications')} className="block py-2 text-slate-300 hover:text-amber-500">Specifications</a>
          <a href="#contact" onClick={(e) => scrollToSection(e, 'contact-form')} className="block py-2 text-slate-300 hover:text-amber-500">Contact</a>
          <a href="tel:+918439860719" className="inline-flex items-center justify-center gap-2 w-full bg-amber-500 text-slate-950 py-3 rounded-lg font-bold">
            <Phone size={18} /> Call Now
          </a>
        </div>
      )}
    </nav>
  );
}