// Importă React și hook-uri necesare
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Importă funcții Firestore pentru citire
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

// Navbar-ul aplicației
import Navbar from "../components/Navbar";

// Componenta principală pentru afișarea istoricului AI
const AiAnalysisHistory = () => {
  // Extrage parametrii din URL (uid și plantId)
  const { uid, plantId } = useParams();

  // Stare pentru lista de analize AI
  const [history, setHistory] = useState([]);

  // Numele plantei pentru afișare
  const [plantName, setPlantName] = useState("");

  // Stare de încărcare
  const [loading, setLoading] = useState(true);

  // Efect secundar: obține datele din Firestore
  useEffect(() => {
    if (!uid || !plantId) return;

    const fetchHistory = async () => {
      const docRef = doc(db, "users", uid);               // referință către utilizator
      const docSnap = await getDoc(docRef);               // obține documentul

      const plants = docSnap.data()?.plants || [];        // extrage lista de plante

      const plant = plants.find((p) => p.id === plantId); // caută planta curentă
      if (!plant) return;

      setPlantName(plant.name);                           // setează numele plantei
      const analyses = plant.aiHistory || [];             // extrage istoricul AI
      setHistory([...analyses].reverse());                // cele mai recente primele
      setLoading(false);                                  // oprește loaderul
    };

    fetchHistory();
  }, [uid, plantId]);

  return (
    <div className="bg-green-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-300">
          🧠 Istoric AI pentru planta: <span className="italic">{plantName}</span>
        </h1>

        {/* Afișare în funcție de starea de încărcare și conținut */}
        {loading ? (
          <p>Se încarcă analiza AI...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Nu există analize AI salvate pentru această plantă.
          </p>
        ) : (
          <ul className="space-y-4">
            {history.map((entry, index) => (
              <li
                key={index}
                className="p-4 bg-white dark:bg-gray-800 rounded shadow border-l-4 border-green-500"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {new Date(entry.timestamp).toLocaleString("ro-RO")}
                </div>
                <div className="whitespace-pre-line font-medium">
                  {entry.result}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AiAnalysisHistory;
