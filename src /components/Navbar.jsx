// Importă librării și contexte necesare
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";      // Pentru modul dark/light
import { auth } from "../services/firebase";                 // Pentru autentificare Firebase
import { toast } from "react-toastify";                      // Pentru mesaje vizuale (logout)

const Navbar = () => {
  // Obține tema curentă și funcția de toggle din context
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Stare pentru a controla afișarea meniului pe mobil
  const [menuOpen, setMenuOpen] = useState(false);

  // Hook pentru navigare programatică (redirect)
  const navigate = useNavigate();

  // Funcție care deloghează utilizatorul
  const handleLogout = async () => {
    try {
      await auth.signOut();                   // Ieșire din cont Firebase
      toast.success("Te-ai delogat cu succes.");
      navigate("/login");                     // Redirecționează spre login
    } catch (err) {
      toast.error("Eroare la delogare.");     // Dacă apare eroare
    }
  };

  // Clasă comună pentru toate butoanele din navbar
  const btnClass = "w-[120px] text-center px-3 py-2 text-sm font-medium rounded text-white";

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo aplicație – link către homepage */}
          <div className="flex-shrink-0 text-xl font-bold text-green-700 dark:text-green-300">
            <Link to="/">SmartGarden</Link>
          </div>

          {/* Meniu desktop (ascuns pe mobil) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Comută tema între dark și light */}
            <button
              onClick={toggleTheme}
              className={`${btnClass} bg-green-600 hover:bg-green-700`}
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>

            {/* Link către pagina cu notificări */}
            <Link
              to="/notificari"
              className={`${btnClass} bg-blue-600 hover:bg-blue-700`}
            >
              Notificări
            </Link>

            {/* Buton de logout */}
            <button
              onClick={handleLogout}
              className={`${btnClass} bg-red-500 hover:bg-red-600`}
            >
              Logout
            </button>
          </div>

          {/* Iconiță pentru deschiderea meniului mobil (☰ sau ✖) */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-800 dark:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Meniu mobil (afișat doar când menuOpen este true) */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 bg-white dark:bg-gray-800">
          <button
            onClick={toggleTheme}
            className={`${btnClass} bg-green-600 hover:bg-green-700`}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          <Link
            to="/notificari"
            className={`${btnClass} bg-blue-600 hover:bg-blue-700`}
          >
            Notificări
          </Link>

          <button
            onClick={handleLogout}
            className={`${btnClass} bg-red-500 hover:bg-red-600`}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
