import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Phone, User, Home, MapPin, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");

  // ---------- THEME STATE ----------
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };
  // -----------------------------------

  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isDealerPage = location.pathname.startsWith("/dealer");

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
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleLocationSearch = (e) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;
    localStorage.setItem("userPincode", pincodeInput.trim());
    setIsLocationModalOpen(false);
    // Updated route to match Dashboard component route (/dashboard)
    navigate(`/dashboard?pincode=${pincodeInput.trim()}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------------------------------------------------- */
  /*  Simplified navbar for dealer pages — left portion only     */
  /* ---------------------------------------------------------- */
  if (isDealerPage) {
    return (
      <nav className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center gap-4">
            <button
              onClick={() => goTo("/")}
              aria-label="Go to Homepage"
              className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-amber-500 transition"
            >
              <Home size={20} />
            </button>

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
                <span className="text-lg sm:text-xl font-black tracking-wide uppercase leading-none">
                  Tameer Fabricator's
                </span>
              </div>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="ml-auto h-11 w-11 flex items-center justify-center rounded-full bg-slate-100 text-amber-600 dark:bg-slate-800 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>
    );
  }

  /* ---------------------------------------------------------- */
  /*  Full navbar for the rest of the site                       */
  /* ---------------------------------------------------------- */
  return (
    <>
      <nav className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Left Action Buttons: Home & Location Picker */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => goTo("/")}
                aria-label="Go to Homepage"
                className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-amber-500 transition"
              >
                <Home size={20} />
              </button>

              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 text-amber-600 dark:bg-slate-800 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs sm:text-sm font-medium transition border border-slate-200 dark:border-slate-700"
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
                <span className="text-lg sm:text-xl font-black tracking-wide uppercase leading-none">
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

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-100 text-amber-600 dark:bg-slate-800 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Profile / Account Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  <User size={22} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
                    <button onClick={() => goTo("/login")} className="block w-full text-left px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-500 transition">
                      Dealer Login
                    </button>
                    <button onClick={() => goTo("/register")} className="block w-full text-left px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-500 transition border-t border-slate-200 dark:border-slate-700">
                      Register Dealer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {/* Theme Toggle Button (mobile) */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-amber-600 dark:bg-slate-800 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => { setIsOpen(!isOpen); setIsProfileOpen(false); }} className="text-slate-700 dark:text-slate-200 p-2">
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* LOCATION POPUP MODAL */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsLocationModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Find Local Dealer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enter your pincode to check nearby fabricators</p>
              </div>
            </div>

            <form onSubmit={handleLocationSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Enter Pincode (e.g. 243001)
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  placeholder="Enter 6-digit Pincode"
                  className="w-full bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-lg"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg">
                Search Available Dealers
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
