import { createContext, useContext, useState } from "react";

// Creăm contextul pentru plante
const PlantContext = createContext();

// Provider-ul contextului, care învelește componentele și le oferă acces la starea plantelor
export const PlantProvider = ({ children }) => {
  // Starea locală pentru lista de plante
  const [plants, setPlants] = useState([]);

  // Oferim starea și funcția de actualizare către toate componentele copil
  return (
    <PlantContext.Provider value={{ plants, setPlants }}>
      {children}
    </PlantContext.Provider>
  );
};

// Hook personalizat pentru acces ușor la context în orice componentă
export const usePlantContext = () => useContext(PlantContext);
