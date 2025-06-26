// Importă hook-uri React și router
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Importă Firebase și baza de date realtime
import { auth, realtimeDb } from "../services/firebase";
import { ref, onValue } from "firebase/database";

// Componente de la recharts pentru grafice
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from "recharts";

// Componenta care afișează graficele senzorilor
const SensorCharts = () => {
  const { plantId } = useParams();          // Obține plantId din URL
  const [data, setData] = useState([]);     // Date formatate pentru grafice
  const [limit, setLimit] = useState(10);   // Numărul de citiri afișate
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;        // UID-ul utilizatorului curent

  // Efect: ascultă modificările din Realtime Database
  useEffect(() => {
    if (!uid || !plantId) return;

    const sensorsRef = ref(realtimeDb, `realtime_data/${uid}/${plantId}/sensors`);

    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const raw = snapshot.val();
      if (!raw) return setData([]);

      // Sortează cronologic, ia ultimele `limit` intrări
      const entries = Object.entries(raw)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-limit);

      // Formatează datele pentru grafice
      const formatted = entries.map(([timestamp, values]) => ({
        time: timestamp.slice(11, 16), // oră și minut din timestamp
        soilMoisture: values.SoilMoisture ?? null,
        airHumidity: values.Humidity ?? null,
        airTemperature: values.Temperature ?? null,
        lightLevel: values.LightLevel ?? null,
      }));

      setData(formatted);
    });

    return () => unsubscribe();
  }, [uid, plantId, limit]);

  // Funcție reutilizabilă pentru a genera un bloc de grafic
  const chartBlock = (label, dataKey, color) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow w-full">
      <h3 className="text-lg font-semibold mb-2">{label}</h3>
      {data.some((d) => d[dataKey] !== null && d[dataKey] !== undefined) ? (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke={color} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-sm text-gray-500 text-center py-8">
          Nicio citire disponibilă pentru acest senzor.
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      {/* Buton de întoarcere și selector pentru număr citiri */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ⬅ Înapoi la dashboard
        </button>

        {/* Dropdown pentru setarea numărului de citiri */}
        <div>
          <label className="mr-2 font-medium">Număr citiri:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="p-2 rounded border dark:bg-gray-800 dark:text-white"
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Titlu principal */}
      <h2 className="text-3xl font-bold mb-6 text-green-700 dark:text-green-300">
        Evoluția senzorilor - ultimele {limit} citiri
      </h2>

      {/* Afișarea graficelor în grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chartBlock("🌱 Umiditate sol", "soilMoisture", "#3b82f6")}
        {chartBlock("💦 Umiditate aer", "airHumidity", "#10b981")}
        {chartBlock("🌡️ Temperatură aer", "airTemperature", "#f97316")}
        {chartBlock("☀️ Luminozitate", "lightLevel", "#facc15")}
      </div>
    </div>
  );
};

export default SensorCharts;
