import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Phone, User, Home } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const goTo = (path) => {
    setIsOpen(false);
    setIsProfileOpen(false);
    navigate(path);
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setIsOpen(false);
    setIsProfileOpen(false);
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
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
            onClick={() => goTo("/")}
            aria-label="Go to Homepage"
            className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-500 transition"
          >
            <Home size={20} />
          </button>

          {/* Round Logo Section */}
          <button onClick={() => goTo("/")} className="flex items-center gap-3 group text-left">
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
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center font-medium">
            <a
              href="#services"
              onClick={(e) => scrollToSection(e, "services")}
              className="hover:text-amber-500 transition cursor-pointer"
            >
              Services
            </a>
            <a
              href="#specifications"
              onClick={(e) => scrollToSection(e, "specifications")}
              className="hover:text-amber-500 transition cursor-pointer"
            >
              Specifications
            </a>
            <a
              href="#about"
              onClick={(e) => scrollToSection(e, "about")}
              className="hover:text-amber-500 transition cursor-pointer"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, "contact-form")}
              className="hover:text-amber-500 transition cursor-pointer"
            >
              Contact
            </a>
            <a
              href="tel:+918439860719"
              className="bg-amber-500 text-slate-950 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-400 transition"
            >
              <Phone size={18} /> Call Now
            </a>

            {/* Profile Icon with Dropdown (Desktop) */}
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
                    onClick={() => goTo("/login")}
                    className="block w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-700 hover:text-amber-500 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => goTo("/register")}
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
              onClick={() => {
                setIsOpen(!isOpen);
                setIsProfileOpen(false);
              }}
              className="text-slate-200 p-2"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 px-4 pt-2 pb-6 space-y-3 border-b border-slate-800 shadow-xl">
          <a
            href="#services"
            onClick={(e) => scrollToSection(e, "services")}
            className="block py-2 text-slate-300 hover:text-amber-500 font-medium"
          >
            Services
          </a>
          <a
            href="#specifications"
            onClick={(e) => scrollToSection(e, "specifications")}
            className="block py-2 text-slate-300 hover:text-amber-500 font-medium"
          >
            Specifications
          </a>
          <a
            href="#about"
            onClick={(e) => scrollToSection(e, "about")}
            className="block py-2 text-slate-300 hover:text-amber-500 font-medium"
          >
            About
          </a>
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, "contact-form")}
            className="block py-2 text-slate-300 hover:text-amber-500 font-medium"
          >
            Contact
          </a>

          {/* Direct Login & Register links for Mobile */}
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <button
              onClick={() => goTo("/login")}
              className="flex items-center gap-2 w-full text-left py-2 text-amber-500 font-semibold hover:text-amber-400"
            >
              <User size={18} /> Login
            </button>
            <button
              onClick={() => goTo("/register")}
              className="flex items-center gap-2 w-full text-left py-2 text-amber-500 font-semibold hover:text-amber-400"
            >
              <User size={18} /> Sign Up
            </button>
          </div>

          <div className="pt-2">
            <a
              href="tel:+918439860719"
              className="inline-flex items-center justify-center gap-2 w-full bg-amber-500 text-slate-950 py-3 rounded-lg font-bold"
            >
              <Phone size={18} /> Call Now
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}