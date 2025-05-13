import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const getPlantStatus = (soilMoisture) => {
  if (soilMoisture === undefined) return { label: "Necunoscut", color: "bg-gray-300 text-gray-800", icon: "💤" };
  if (soilMoisture < 30) return { label: "În pericol", color: "bg-red-200 text-red-800", icon: "⚠️" };
  if (soilMoisture >= 30 && soilMoisture < 60) return { label: "Acceptabil", color: "bg-yellow-200 text-yellow-800", icon: "🟡" };
  return { label: "Bună", color: "bg-green-200 text-green-800", icon: "🌿" };
};

const PlantCard = ({ plant, sensorData, onWater, isWatering, history = [], onDelete, onEdit }) => {
  const status = getPlantStatus(sensorData?.soilMoisture);

  return (
    <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <h2 className="text-xl font-semibold text-green-700 dark:text-green-300">{plant.name}</h2>
      <p><strong>Udare:</strong> {plant.waterFreq}</p>
      <p><strong>Lumină:</strong> {plant.light}</p>
      <p><strong>Temperatură:</strong> {plant.temp}</p>
      <p><strong>Umiditate aer:</strong> {plant.airHumidity}</p>

      <div className={`inline-block px-3 py-1 mt-2 rounded-full text-sm font-semibold ${status.color}`}>
        {status.icon} Stare: {status.label}
      </div>

      <div className="mt-3">
        <h3 className="font-semibold">Date senzori:</h3>
        <p>🌱 Umiditate sol: {sensorData?.soilMoisture ?? "–"}%</p>
        <p>🌡️ Temp. aer: {sensorData?.airTemp ?? "–"}°C</p>
        <p>💧 Umiditate aer: {sensorData?.airHumidity ?? "–"}%</p>
        <p>☀️ Lumină: {sensorData?.light ?? "–"}</p>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Evoluție umiditate sol</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="soilMoisture" stroke="#16a34a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button
          onClick={onWater}
          disabled={isWatering}
          className={`py-2 px-4 rounded text-white w-full sm:w-auto ${
            isWatering ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isWatering ? "Se udă..." : "Udă planta"}
        </button>
        <button
          onClick={() => onEdit(plant)}
          className="bg-yellow-500 text-white py-2 px-3 rounded hover:bg-yellow-600 w-full sm:w-auto"
        >
          Editează
        </button>
        <button
          onClick={() => onDelete(plant)}
          className="bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 w-full sm:w-auto"
        >
          Șterge
        </button>
      </div>
    </div>
  );
};

export default PlantCard;
