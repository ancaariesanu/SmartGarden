import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { auth } from "../services/firebase";
import { toast } from "react-toastify";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Te-ai delogat cu succes.");
      navigate("/login");
    } catch (err) {
      toast.error("Eroare la delogare.");
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 text-xl font-bold text-green-700 dark:text-green-300">
            <Link to="/">SmartGarden</Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleTheme} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
              Logout
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-800 dark:text-white focus:outline-none"
            >
              {menuOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 bg-white dark:bg-gray-800">
          <button onClick={toggleTheme} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
