import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Key } from "lucide-react";

export default function Navbar({ user, tab, setTab, onWeatherAIClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleEditPassword = () => {
    window.location.href = "/edit-password";
  };

  return (
    <nav className="w-full bg-white/90 border-b border-blue-100 px-4 py-2 flex items-center justify-between shadow-sm z-50 fixed top-0 left-0">
      <div className="flex items-center gap-6">
        <img src="/weather.jpeg" alt="Weather AI Logo" className="h-8 w-8" />
        <span
          className="text-xl font-bold text-blue-700 tracking-tight cursor-pointer"
          onClick={onWeatherAIClick}
        >
          WeatherAI
        </span>
        {/* <button
          className={`px-3 py-1 rounded text-blue-700 font-medium hover:bg-blue-100 ${
            tab === "weather" ? "bg-blue-100" : ""
          }`}
          onClick={() => setTab && setTab("weather")}
        >
          Weather
        </button> */}
      </div>
      {user && (
        <div className="relative" ref={menuRef}>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium focus:outline-none"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span>{user.name || user.email}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-blue-100 rounded shadow-lg z-50 flex flex-col divide-y divide-blue-50">
              <button
                className="px-4 py-2 text-left hover:bg-blue-50 text-blue-700 flex items-center gap-2"
                onClick={handleEditPassword}
              >
                <Key className="h-4 w-4" /> Edit Password
              </button>
              <button
                className="px-4 py-2 text-left hover:bg-blue-50 text-blue-700 flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
