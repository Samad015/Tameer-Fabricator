import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Phone, User, Home, MapPin, Navigation, Loader2, Search } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  
  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Default state localStorage ya fallback se load hogi
  const [currentLocationText, setCurrentLocationText] = useState(() => {
    return localStorage.getItem("userLocationName") || "Bareilly, UP";
  });
  const [detectingGPS, setDetectingGPS] = useState(false);
  
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isDealerPage = location.pathname.startsWith("/dealer");

  // Reverse geocoding for GPS with proper state formatting
  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.state_district || "Bareilly";
        
        let stateName = data.address.state || "";
        if (stateName.toLowerCase().includes("uttar pradesh")) {
          stateName = "UP";
        } else if (stateName.toLowerCase().includes("uttarakhand")) {
          stateName = "UK";
        } else {
          stateName = stateName ? stateName.substring(0, 2).toUpperCase() : "";
        }

        const locationString = `${city}, ${stateName}`;
        
        // LocalStorage mein save karein taaki data persist rahe
        localStorage.setItem("userLocationName", locationString);
        localStorage.setItem("userCity", city);
        
        // Sirf Navbar ka text update hoga, page redirect nahi hoga!
        setCurrentLocationText(locationString);
        setDetectingGPS(false);
        setIsLocationModalOpen(false);

        // NOTE: Yahan se navigate('/dashboard...') hata diya gaya hai 
        // taaki user apne current page par hi bana rahe.
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setDetectingGPS(false);
      alert("Failed to fetch address from coordinates.");
    }
  };

  // 1. Page Load / Refresh par Automatic Background GPS Check
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchAddressFromCoords(latitude, longitude);
        },
        (error) => {
          console.warn("Background auto-location skipped or denied:", error.message);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // 2. Jab user modal mein manually GPS button par click karega
  const handleNativeGPSDetect = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchAddressFromCoords(latitude, longitude);
      },
      (error) => {
        console.warn("Browser GPS error/denied:", error.message);
        setDetectingGPS(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert("Location access was denied. Please allow location permission in your browser settings or search manually.");
        } else {
          alert("Unable to retrieve your location via GPS.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Live Search Suggestions as user types
  useEffect(() => {
    if (locationQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&countrycodes=in&addressdetails=1&limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Search suggestion error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [locationQuery]);

  // Select location from suggestion dropdown (Yahan bhi redirection hata di hai)
  const handleSelectSuggestion = (item) => {
    const city = item.address?.city || item.address?.town || item.address?.village || item.address?.state_district || item.display_name.split(",")[0];
    
    let stateName = item.address?.state || "";
    if (stateName.toLowerCase().includes("uttar pradesh")) {
      stateName = "UP";
    } else if (stateName.toLowerCase().includes("uttarakhand")) {
      stateName = "UK";
    } else {
      stateName = stateName ? stateName.substring(0, 2).toUpperCase() : "";
    }

    const locationString = `${city}, ${stateName}`;

    localStorage.setItem("userLocationName", locationString);
    localStorage.setItem("userCity", city);
    setCurrentLocationText(locationString);
    setIsLocationModalOpen(false);
    setLocationQuery("");
    setSuggestions([]);

    // Redirection removed here as well. User same page par rahega.
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isDealerPage) {
    return (
      <nav className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center gap-4">
            <button onClick={() => goTo("/")} className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-500 transition">
              <Home size={20} />
            </button>
            <button onClick={() => goTo("/")} className="flex items-center gap-3 group text-left">
              <img src="/images/logo.jpg" alt="Logo" className="h-14 w-14 object-cover rounded-full border-2 border-amber-500 shadow-md" />
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-500 font-semibold leading-none mb-1">Welcome to</span>
                <span className="text-lg sm:text-xl font-black text-white tracking-wide uppercase leading-none">Tameer Fabricator's</span>
              </div>
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Left Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => goTo("/")}
                className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-500 transition"
              >
                <Home size={20} />
              </button>

              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-800 text-amber-400 hover:bg-slate-700 text-xs sm:text-sm font-medium transition border border-slate-700 max-w-[180px] sm:max-w-xs truncate"
                title={currentLocationText}
              >
                <MapPin size={18} className="text-amber-500 shrink-0" />
                <span className="truncate">{currentLocationText}</span>
              </button>
            </div>

            {/* Logo */}
            <button onClick={() => goTo("/")} className="flex items-center gap-3 group text-left">
              <img src="/images/logo.jpg" alt="Logo" className="h-14 w-14 object-cover rounded-full border-2 border-amber-500 shadow-md" />
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-500 font-semibold leading-none mb-1">Welcome to</span>
                <span className="text-lg sm:text-xl font-black text-white tracking-wide uppercase leading-none">Tameer Fabricator's</span>
              </div>
            </button>

            {/* Desktop Links */}
            <div className="hidden md:flex space-x-8 items-center font-medium">
              <a href="#services" onClick={(e) => scrollToSection(e, "services")} className="hover:text-amber-500 transition cursor-pointer">Services</a>
              <a href="#specifications" onClick={(e) => scrollToSection(e, "specifications")} className="hover:text-amber-500 transition cursor-pointer">Specifications</a>
              <a href="#about" onClick={(e) => scrollToSection(e, "about")} className="hover:text-amber-500 transition cursor-pointer">About</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, "contact-form")} className="hover:text-amber-500 transition cursor-pointer">Contact</a>
              
              <a href="tel:+918439860719" className="bg-amber-500 text-slate-950 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-400 transition">
                <Phone size={18} /> Call Now
              </a>

              <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition">
                  <User size={22} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
                    <button onClick={() => goTo("/login")} className="block w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-700 hover:text-amber-500 transition">Dealer Login</button>
                    <button onClick={() => goTo("/register")} className="block w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-700 hover:text-amber-500 transition border-t border-slate-700">Register Dealer</button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <button onClick={() => { setIsOpen(!isOpen); setIsProfileOpen(false); }} className="text-slate-200 p-2">
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* LOCATION POPUP MODAL */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsLocationModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Choose Location</h3>
                <p className="text-xs text-slate-400">Allow browser GPS access or search city</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Native Browser GPS Trigger Button */}
              <button
                type="button"
                onClick={handleNativeGPSDetect}
                disabled={detectingGPS}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 group shadow-md"
              >
                {detectingGPS ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-amber-500" />
                    <span>Requesting Browser Access...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={18} className="text-amber-500 group-hover:rotate-45 transition" />
                    <span>Use My Current Location (GPS)</span>
                  </>
                )}
              </button>

              <div className="flex items-center my-1">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="px-3 text-xs uppercase tracking-widest text-slate-500 font-semibold">Or Search City</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Autocomplete Input */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Type City Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="e.g. Bareilly, Rampur..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                  />
                  {isSearching && (
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-amber-500">
                      <Loader2 size={16} className="animate-spin" />
                    </span>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {suggestions.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectSuggestion(item)}
                        className="px-4 py-3 text-xs sm:text-sm text-slate-200 hover:bg-slate-700 hover:text-amber-400 cursor-pointer border-b border-slate-700/50 last:border-none flex items-start gap-2"
                      >
                        <MapPin size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{item.display_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}