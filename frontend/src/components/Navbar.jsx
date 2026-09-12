import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Phone, User, MapPin, Sun, Moon, Search, Loader2, Navigation } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [dealerPhone, setDealerPhone] = useState("+918439860719");
  const [currentLocationText, setCurrentLocationText] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userLocationName") || "Bareilly, UP";
    }
    return "Bareilly, UP";
  });
  const [detectingGPS, setDetectingGPS] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    return window.location.hostname === 'localhost' ? 'http://localhost:5001' : '';
  };

  // Fetch active dealer's phone number based on location
  const fetchDealerContact = async () => {
    const selectedLocation = localStorage.getItem('userCity') || localStorage.getItem('userLocationName')?.split(',')[0] || 'Bareilly';

    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/dealers/search?location=${encodeURIComponent(selectedLocation)}`);
      const data = await response.json();

      if (data.success && data.dealers && data.dealers.length > 0) {
        const activeDealer = data.dealers[0];
        if (activeDealer.phone) {
          setDealerPhone(activeDealer.phone);
        } else {
          setDealerPhone("+918439860719");
        }
      } else {
        setDealerPhone("+918439860719");
      }
    } catch (error) {
      console.error("Error fetching dealer contact:", error);
      setDealerPhone("+918439860719");
    }
  };

  useEffect(() => {
    fetchDealerContact();

    window.addEventListener('cityChanged', fetchDealerContact);
    window.addEventListener('storage', fetchDealerContact);

    return () => {
      window.removeEventListener('cityChanged', fetchDealerContact);
      window.removeEventListener('storage', fetchDealerContact);
    };
  }, []);

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
        
        localStorage.setItem("userLocationName", locationString);
        localStorage.setItem("userCity", city);
        
        window.dispatchEvent(new Event('cityChanged'));

        setCurrentLocationText(locationString);
        setDetectingGPS(false);
        setIsLocationModalOpen(false);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setDetectingGPS(false);
      alert("Failed to fetch address from coordinates.");
    }
  };

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

  const handleLocationSearch = async (e) => {
    e.preventDefault();

    const pincode = pincodeInput.trim();

    if (!/^\d{6}$/.test(pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();

      if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length) {
        const office = data[0].PostOffice[0];
        const city = office.District || office.Block || office.Name || "Bareilly";
        let stateName = office.State || "";

        if (stateName.toLowerCase().includes("uttar pradesh")) {
          stateName = "UP";
        } else if (stateName.toLowerCase().includes("uttarakhand")) {
          stateName = "UK";
        } else {
          stateName = stateName
            ? stateName.substring(0, 2).toUpperCase()
            : "";
        }

        const locationString = `${city}, ${stateName}`;
        localStorage.setItem("userLocationName", locationString);
        localStorage.setItem("userCity", city);
        window.dispatchEvent(new Event("cityChanged"));

        setCurrentLocationText(locationString);
        setIsLocationModalOpen(false);
        setPincodeInput("");
      } else {
        alert("No location found for this pincode.");
      }
    } catch (error) {
      console.error("Pincode search error:", error);
      alert("Unable to search this pincode. Please try again.");
    }
  };

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

    window.dispatchEvent(new Event('cityChanged'));

    setCurrentLocationText(locationString);
    setIsLocationModalOpen(false);
    setLocationQuery("");
    setSuggestions([]);
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
      <nav className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center gap-4">
            <button onClick={() => goTo("/")} aria-label="Go to Homepage" className="flex items-center gap-3 group text-left cursor-pointer">
              <img src="/images/logo.jpg" alt="Logo" className="h-14 w-14 object-cover rounded-full border-2 border-amber-500 shadow-md" />
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
              className="ml-auto h-11 w-11 flex items-center justify-center rounded-full bg-slate-100 text-amber-600 dark:bg-slate-800 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            <div className="flex items-center gap-2">
              <button onClick={() => goTo("/")} aria-label="Go to Homepage" className="flex items-center gap-3 group text-left cursor-pointer">
                <img src="/images/logo.jpg" alt="Logo" className="h-14 w-14 object-cover rounded-full border-2 border-amber-500 shadow-md" />
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-500 font-semibold leading-none mb-1">
                    Welcome to
                  </span>
                  <span className="text-lg sm:text-xl font-black tracking-wide uppercase leading-none">
                    Tameer Fabricator's
                  </span>
                </div>
              </button>

              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 text-amber-600 dark:bg-slate-800 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs sm:text-sm font-medium transition border border-slate-200 dark:border-slate-700 max-w-[180px] sm:max-w-xs truncate cursor-pointer"
                title={currentLocationText}
              >
                <MapPin size={18} className="text-amber-500 shrink-0" />
                <span className="truncate">{currentLocationText}</span>
              </button>
            </div>

            <div className="hidden md:flex space-x-8 items-center font-medium">
              <a href="#services" onClick={(e) => scrollToSection(e, "services")} className="hover:text-amber-500 transition cursor-pointer">Services</a>
              <a href="#specifications" onClick={(e) => scrollToSection(e, "specifications")} className="hover:text-amber-500 transition cursor-pointer">Specifications</a>
              <a href="#about" onClick={(e) => scrollToSection(e, "about")} className="hover:text-amber-500 transition cursor-pointer">About</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, "contact-form")} className="hover:text-amber-500 transition cursor-pointer">Contact</a>
              
              {/* Dynamic Location-Based Call Button */}
              <a href={`tel:${dealerPhone}`} className="bg-amber-500 text-slate-950 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-400 transition cursor-pointer">
                <Phone size={18} /> Call Now
              </a>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-100 text-amber-600 dark:bg-slate-800 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Profile / Account Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="h-11 w-11 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
                >
                  <User size={22} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
                    <button onClick={() => goTo("/login")} className="block w-full text-left px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-500 transition cursor-pointer">
                      Dealer Login
                    </button>
                    <button onClick={() => goTo("/register")} className="block w-full text-left px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-500 transition border-t border-slate-200 dark:border-slate-700 cursor-pointer">
                      Register Dealer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-amber-600 dark:bg-slate-800 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => { setIsOpen(!isOpen); setIsProfileOpen(false); }} className="text-slate-700 dark:text-slate-200 p-2 cursor-pointer">
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-slate-950 border-t border-slate-800 px-4 pt-3 pb-6 space-y-3">
            <a href="#services" onClick={(e) => scrollToSection(e, "services")} className="block py-2 text-slate-300 hover:text-amber-500 font-medium">Services</a>
            <a href="#specifications" onClick={(e) => scrollToSection(e, "specifications")} className="block py-2 text-slate-300 hover:text-amber-500 font-medium">Specifications</a>
            <a href="#about" onClick={(e) => scrollToSection(e, "about")} className="block py-2 text-slate-300 hover:text-amber-500 font-medium">About</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, "contact-form")} className="block py-2 text-slate-300 hover:text-amber-500 font-medium">Contact</a>
            
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button onClick={() => goTo("/login")} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg text-sm font-bold text-center">Dealer Login</button>
              <button onClick={() => goTo("/register")} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-lg text-sm font-bold text-center">Register</button>
            </div>
          </div>
        )}
      </nav>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsLocationModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Find Local Dealer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Use GPS or search by city / pincode</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleNativeGPSDetect}
                disabled={detectingGPS}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 group shadow-sm cursor-pointer"
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
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="px-3 text-xs uppercase tracking-widest text-slate-400 font-semibold">Or Search City</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* City Search Field */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Type City Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="e.g. Bareilly, Rampur, Delhi..."
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-amber-500"
                  />
                  {isSearching && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-amber-500">
                      <Loader2 size={16} className="animate-spin" />
                    </span>
                  )}
                </div>

                {suggestions.length > 0 && (
                  <div className="absolute z-30 mt-2 w-full bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {suggestions.map((item, index) => {
                      const cityName = item.address?.city || item.address?.town || item.address?.village || item.address?.state_district || item.display_name.split(",")[0];
                      const state = item.address?.state || "";
                      return (
                        <button
                          key={index}
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full text-left px-4 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 transition flex items-center gap-2 cursor-pointer"
                        >
                          <MapPin size={14} className="text-amber-500 shrink-0" />
                          <span className="truncate"><strong>{cityName}</strong>, {state}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
