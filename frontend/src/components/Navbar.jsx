import React, { useState, useRef, useEffect } from "react";
import { Menu, X, Phone, User, Home } from "lucide-react";

export default function Navbar({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const goTo = (page) => {
    setIsOpen(false);
    setIsProfileOpen(false);
    if (onNavigate) onNavigate(page);
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Home Icon Button */}
          <button
            onClick={() => goTo("home")}
            aria-label="Go to Homepage"
            className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-500 transition"
          >
            <Home size={20} />
          </button>

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
            <a
              href="#services"
              onClick={(e) => scrollToSection(e, "services")}
              className="hover:text-amber-500 transition"
            >
              Services
            </a>
            <a
              href="#specifications"
              onClick={(e) => scrollToSection(e, "specifications")}
              className="hover:text-amber-500 transition"
            >
              Specifications
            </a>
            <a
              href="#about"
              onClick={(e) => scrollToSection(e, "about")}
              className="hover:text-amber-500 transition"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, "contact-form")}
              className="hover:text-amber-500 transition"
            >
              Contact
            </a>
            <a
              href="tel:+918439860719"
              className="bg-amber-500 text-slate-950 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-400 transition"
            >
              <Phone size={18} /> Call Now
            </a>

            {/* Profile Icon with Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
                aria-label="Account"
              >
                <User size={22} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => goTo("login")}
                    className="block w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-700 hover:text-amber-500 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => goTo("signup")}
                    className="block w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-700 hover:text-amber-500 transition border-t border-slate-700"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-200"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 px-4 pt-2 pb-6 space-y-3 border-b border-slate-800">
          <a
            href="#services"
            onClick={(e) => scrollToSection(e, "services")}
            className="block py-2 text-slate-300 hover:text-amber-500"
          >
            Services
          </a>
          <a
            href="#specifications"
            onClick={(e) => scrollToSection(e, "specifications")}
            className="block py-2 text-slate-300 hover:text-amber-500"
          >
            Specifications
          </a>
          <a
            href="#about"
            onClick={(e) => scrollToSection(e, "about")}
            className="block py-2 text-slate-300 hover:text-amber-500"
          >
            About
          </a>
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, "contact-form")}
            className="block py-2 text-slate-300 hover:text-amber-500"
          >
            Contact
          </a>
          <a
            href="tel:+918439860719"
            className="inline-flex items-center justify-center gap-2 w-full bg-amber-500 text-slate-950 py-3 rounded-lg font-bold"
          >
            <Phone size={18} /> Call Now
          </a>

          {/* Profile Icon with Dropdown (Mobile) */}
          <div>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center gap-2 w-full bg-slate-700 text-slate-300 py-3 rounded-lg font-bold hover:bg-slate-600 transition"
            >
              <User size={18} /> Account
            </button>

            {isProfileOpen && (
              <div className="mt-2 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => goTo("login")}
                  className="block w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-700 hover:text-amber-500 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => goTo("signup")}
                  className="block w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-700 hover:text-amber-500 transition border-t border-slate-700"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}