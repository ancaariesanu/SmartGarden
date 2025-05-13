import { createContext, useContext, useState } from "react";

const PlantContext = createContext();

export const PlantProvider = ({ children }) => {
  const [plants, setPlants] = useState([]);

  return (
    <PlantContext.Provider value={{ plants, setPlants }}>
      {children}
    </PlantContext.Provider>
  );
};

export const usePlantContext = () => useContext(PlantContext);
