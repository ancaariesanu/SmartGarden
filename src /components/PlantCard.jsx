// Importă React și iconițe
import React from "react";
import {
  FaEdit,
  FaTrash,
  FaTint,
  FaHome,
  FaSun,
  FaTemperatureHigh,
  FaCloudMeatball,
} from "react-icons/fa";

// Importă librării pentru notificări și navigare
import { toast } from "react-toastify";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Transformă în număr doar dacă valoarea este definită
const numeric = (v) => (v !== undefined ? Number(v) : undefined);

// Returnează o clasă CSS în funcție de cât de bună e valoarea
const getColor = (value, min, max) => {
  if (value === undefined || isNaN(value)) return "text-gray-400";
  if (value < min) return "text-red-500";
  if (value > max) return "text-yellow-500";
  return "text-green-600";
};

// Salvează rezultatul analizei AI în Firestore
const saveAiAnalysis = async (plantId, message) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();

  const updatedPlants = data.plants.map((p) => {
    if (p.id === plantId) {
      const history = p.aiHistory || [];
      return {
        ...p,
        aiHistory: [
          ...history,
          {
            timestamp: new Date().toISOString(),
            result: message,
          },
        ],
      };
    }
    return p;
  });

  await updateDoc(docRef, { plants: updatedPlants });
};

// Trimite imaginea către serverul local de AI pentru analiză
const analyzePlantImage = async (plantId, imageBase64) => {
  if (!imageBase64) {
    toast.error("Planta nu are o imagine.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3001/analyze-plant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64 }),
    });

    const data = await res.json();

    if (data.message) {
      toast.success(`🧠 GPT spune: ${data.message}`);
      await saveAiAnalysis(plantId, data.message);
    } else {
      toast.error(data.error || "Eroare la analiză.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Conexiune eșuată cu serverul de analiză.");
  }
};

// Componență ce afișează informațiile unei plante
const PlantCard = ({ plant, sensorData, onWater, isWatering, history, onEdit, onDelete }) => {
  const navigate = useNavigate();

  // Apelează udarea cu confirmare
  const handleConfirmWater = () => {
    onWater(plant.id);
  };

  const hasDevice = !!plant.deviceCode;
  const uid = auth.currentUser?.uid;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md relative">
      
      {/* Numele plantei */}
      <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-300">
        {plant.name}
      </h3>

      {/* Imagine plantă (dacă există) */}
      {plant.imageBase64 && (
        <img
          src={plant.imageBase64}
          alt={plant.name}
          className="w-full h-40 object-cover rounded mb-2"
        />
      )}

      {/* Informații despre recomandări */}
      <ul className="text-sm mb-4 space-y-1">
        <li><FaHome className="inline mr-1" /><strong>Tip:</strong> {plant.locationType === "indoor" ? "Interior" : "Exterior"}</li>
        <li><FaTint className="inline mr-1" /><strong>Udare:</strong> {plant.waterFreq}</li>
        <li><FaSun className="inline mr-1" /><strong>Lumină:</strong> {plant.light}</li>
        <li><FaTemperatureHigh className="inline mr-1" /><strong>Temperatură:</strong> {plant.temp}</li>
        <li><FaCloudMeatball className="inline mr-1" /><strong>Umiditate aer:</strong> {plant.airHumidity}</li>
      </ul>

      {/* Avertisment dacă planta nu are deviceCode */}
      {!hasDevice && (
        <div className="text-sm italic text-red-500 mb-2">
          ⚠️ Adaugă un cod de dispozitiv pentru a vedea datele senzorilor.
        </div>
      )}

      {/* Date live de la senzori, dacă planta are senzor conectat */}
      {hasDevice && (
        <ul className="text-sm mb-4 space-y-1 border-t pt-2">
          <li>
            🌡️ <strong>Temperatura aerului:</strong>{" "}
            <span className={getColor(numeric(sensorData.airTemperature), 18, 28)}>
              {numeric(sensorData.airTemperature) ?? "–"} °C
            </span>
          </li>
          <li>
            💦 <strong>Umiditatea aerului:</strong>{" "}
            <span className={getColor(numeric(sensorData.airHumidity), 40, 70)}>
              {numeric(sensorData.airHumidity) ?? "–"} %
            </span>
          </li>
          <li>
            🌱 <strong>Umiditate sol:</strong>{" "}
            <span className={getColor(numeric(sensorData.soilMoisture), 30, 70)}>
              {numeric(sensorData.soilMoisture) ?? "–"} %
            </span>
          </li>
          <li>
            ☀️ <strong>Lumină:</strong>{" "}
            <span className={getColor(numeric(sensorData.lightLevel), 300, 1000)}>
              {numeric(sensorData.lightLevel) ?? "–"} lux
            </span>
          </li>
        </ul>
      )}

      {/* Butoane de acțiune */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => onEdit(plant)}
          className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded"
        >
          <FaEdit />
          Editează
        </button>

        <button
          onClick={() => onDelete(plant)}
          className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
        >
          <FaTrash />
          Șterge
        </button>

        <button
          onClick={() => analyzePlantImage(plant.id, plant.imageBase64)}
          className="flex items-center gap-1 px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded"
        >
          🤖 Analizează
        </button>

        <button
          onClick={() => navigate(`/analize/${uid}/${plant.id}`)}
          className="flex items-center gap-1 px-3 py-1 bg-green-700 hover:bg-green-800 text-white text-sm rounded"
        >
          🧠 Istoric AI
        </button>

        {/* Buton udare și grafic doar dacă planta are senzor conectat */}
        {hasDevice && (
          <>
            <button
              onClick={handleConfirmWater}
              disabled={isWatering}
              className={`flex items-center gap-1 px-3 py-1 text-white text-sm rounded ${
                isWatering ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaTint />
              {isWatering ? "Se udă..." : "Udă planta"}
            </button>

            <button
              onClick={() => navigate(`/grafice/${plant.id}`)}
              className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
            >
              📊 Grafic
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PlantCard;
