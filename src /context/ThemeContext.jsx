import React, { createContext, useEffect, useState } from "react";

// Creăm contextul pentru tema aplicației (light/dark)
export const ThemeContext = createContext();

// Provider-ul contextului pentru temă
export const ThemeProvider = ({ children }) => {
  // Inițializăm tema cu valoarea din localStorage sau "light" dacă nu există
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") || "light"
  );

  // La fiecare schimbare a temei, actualizăm clasa HTML și salvăm în localStorage
  useEffect(() => {
    // Înlăturăm toate clasele posibile de temă
    document.documentElement.classList.remove("light", "dark");
    // Adăugăm clasa curentă de temă (light sau dark)
    document.documentElement.classList.add(theme);
    // Salvăm tema în localStorage pentru persistenta între sesiuni
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Funcție pentru schimbarea temei între light și dark
  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  // Oferim tema curentă și funcția toggle către toate componentele din interior
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
