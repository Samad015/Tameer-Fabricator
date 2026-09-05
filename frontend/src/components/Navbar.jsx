import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Phone, User, Home, MapPin } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const goTo = (path) => {
    setIsOpen(false);
    setIsProfileOpen(false);
    setIsLocationModalOpen(false);
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

  const handleLocationSearch = (e) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;
    // Pincode ko save karke dealers page par redirect kar denge
    localStorage.setItem("userPincode", pincodeInput.trim());
    setIsLocationModalOpen(false);
    navigate(`/dealers?pincode=${pincodeInput.trim()}`);
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
    <>
      <nav className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Left Action Buttons: Home & Location Picker */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => goTo("/")}
                aria-label="Go to Homepage"
                className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-500 transition"
                title="Home"
              >
                <Home size={20} />
              </button>

              {/* LOCATION BUTTON (Customer ke liye bina login ke) */}
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-800 text-amber-400 hover:bg-slate-700 text-xs sm:text-sm font-medium transition border border-slate-700"
                title="Select Location / Find Dealers"
              >
                <MapPin size={18} className="text-amber-500 animate-pulse" />
                <span className="hidden sm:inline">Select Location</span>
              </button>
            </div>

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

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-8 items-center font-medium">
              <a href="#services" onClick={(e) => scrollToSection(e, "services")} className="hover:text-amber-500 transition cursor-pointer">Services</a>
              <a href="#specifications" onClick={(e) => scrollToSection(e, "specifications")} className="hover:text-amber-500 transition cursor-pointer">Specifications</a>
              <a href="#about" onClick={(e) => scrollToSection(e, "about")} className="hover:text-amber-500 transition cursor-pointer">About</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, "contact-form")} className="hover:text-amber-500 transition cursor-pointer">Contact</a>
              
              <a href="tel:+918439860719" className="bg-amber-500 text-slate-950 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-400 transition">
                <Phone size={18} /> Call Now
              </a>

              {/* Profile / Account Dropdown */}
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
                    <button onClick={() => goTo("/login")} className="block w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-700 hover:text-amber-500 transition">
                      Login (Dealers)
                    </button>
                    <button onClick={() => goTo("/register")} className="block w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-700 hover:text-amber-500 transition border-t border-slate-700">
                      Register Dealer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => { setIsOpen(!isOpen); setIsProfileOpen(false); }} className="text-slate-200 p-2" aria-label="Toggle Menu">
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden bg-slate-900 px-4 pt-2 pb-6 space-y-3 border-b border-slate-800 shadow-xl">
            <a href="#services" onClick={(e) => scrollToSection(e, "services")} className="block py-2 text-slate-300 hover:text-amber-500 font-medium">Services</a>
            <a href="#specifications" onClick={(e) => scrollToSection(e, "specifications")} className="block py-2 text-slate-300 hover:text-amber-500 font-medium">Specifications</a>
            <a href="#about" onClick={(e) => scrollToSection(e, "about")} className="block py-2 text-slate-300 hover:text-amber-500 font-medium">About</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, "contact-form")} className="block py-2 text-slate-300 hover:text-amber-500 font-medium">Contact</a>

            <div className="border-t border-slate-800 pt-3 space-y-2">
              <button onClick={() => goTo("/login")} className="flex items-center gap-2 w-full text-left py-2 text-amber-500 font-semibold">
                <User size={18} /> Dealer Login
              </button>
              <button onClick={() => goTo("/register")} className="flex items-center gap-2 w-full text-left py-2 text-amber-500 font-semibold">
                <User size={18} /> Register as Dealer
              </button>
            </div>

            <div className="pt-2">
              <a href="tel:+918439860719" className="inline-flex items-center justify-center gap-2 w-full bg-amber-500 text-slate-950 py-3 rounded-lg font-bold">
                <Phone size={18} /> Call Now
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* LOCATION POPUP MODAL */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsLocationModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Find Local Dealer</h3>
                <p className="text-xs text-slate-400">Enter your pincode to check nearby fabricators</p>
              </div>
            </div>

            <form onSubmit={handleLocationSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Enter Pincode (e.g. 243001)
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  placeholder="Enter 6-digit Pincode"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-lg"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                Search Available Dealers
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}