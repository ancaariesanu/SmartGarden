import React, { useEffect, useState } from "react";
import { auth, db, realtimeDb } from "../services/firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, onValue, set } from "firebase/database";
import axios from "axios";
import Navbar from "../components/Navbar";
import PlantCard from "../components/PlantCard";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [sensorData, setSensorData] = useState({});
  const [history, setHistory] = useState([]);
  const [weather, setWeather] = useState({});
  const [editingPlantId, setEditingPlantId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [form, setForm] = useState({
    name: "",
    waterFreq: "",
    light: "",
    temp: "",
    airHumidity: "",
  });

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    const fetchUserData = async () => {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setUserData(docSnap.data());
    };
    fetchUserData();
  }, [uid]);

  useEffect(() => {
    if (!userData?.city) return;
    axios
      .get(`https://api.openweathermap.org/data/2.5/weather?q=${userData.city}&appid=c0a00779dd0d1f198c1d7d118695fad3&units=metric`)
      .then(({ data }) => {
        setWeather({
          temp: data.main.temp,
          desc: data.weather[0].description,
        });
      })
      .catch(() => toast.error("Nu am putut obține vremea."));
  }, [userData]);

  useEffect(() => {
    if (!uid) return;
    const sensorRef = ref(realtimeDb, `realtime_data/${uid}/plant1/sensors`);
    return onValue(sensorRef, (snapshot) => {
      setSensorData(snapshot.val() || {});
    });
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const historyRef = ref(realtimeDb, `realtime_data/${uid}/plant1/history`);
    return onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([t, v]) => ({
          time: t.slice(11, 16),
          soilMoisture: v.soilMoisture,
        }));
        setHistory(formatted);
      }
    });
  }, [uid]);

  const handleAddPlant = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!form.name || !form.waterFreq || !form.light || !form.temp || !form.airHumidity) {
      toast.error("Toate câmpurile sunt obligatorii!");
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    const existing = docSnap.data()?.plants || [];

    const plant = {
      id: editingPlantId || "plant" + Date.now(),
      ...form,
    };

    const updatedPlants = editingPlantId
      ? existing.map((p) => (p.id === editingPlantId ? plant : p))
      : [...existing, plant];

    await updateDoc(docRef, { plants: updatedPlants });

    setUserData((prev) => ({
      ...prev,
      plants: updatedPlants,
    }));

    toast.success(editingPlantId ? "Planta a fost modificată!" : "Planta a fost adăugată!");
    setForm({ name: "", waterFreq: "", light: "", temp: "", airHumidity: "" });
    setEditingPlantId(null);
    setIsLoading(false);
  };

  const handleEditPlant = (plant) => {
    setForm({
      name: plant.name,
      waterFreq: plant.waterFreq,
      light: plant.light,
      temp: plant.temp,
      airHumidity: plant.airHumidity,
    });
    setEditingPlantId(plant.id);
  };

  const handleDeletePlant = async (plantToDelete) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    const filtered = (docSnap.data()?.plants || []).filter((p) => p.id !== plantToDelete.id);
    await updateDoc(docRef, { plants: filtered });

    setUserData((prev) => ({
      ...prev,
      plants: filtered,
    }));

    toast.success(`Planta "${plantToDelete.name}" a fost ștearsă.`);
  };

  const handleWaterPlant = async () => {
    setIsWatering(true);
    const waterRef = ref(realtimeDb, `realtime_data/${uid}/plant1/command`);
    await set(waterRef, { waterPlant: true });
    toast.info("Comanda de udare a fost trimisă!");
    setTimeout(() => setIsWatering(false), 1500);
  };

  const handleCityChange = async (e) => {
    e.preventDefault();
    const newCity = e.target.city.value.trim();
    if (!newCity) return;
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, { city: newCity });
    setUserData((prev) => ({ ...prev, city: newCity }));
    toast.success("Orașul a fost actualizat!");
  };

  return (
    <div className="bg-green-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-700 dark:text-green-300">Dashboard</h1>

        <form onSubmit={handleAddPlant} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-3">{editingPlantId ? "Editează Plantă" : "Adaugă Plantă"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nume plantă" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
            <select value={form.waterFreq} onChange={(e) => setForm({ ...form, waterFreq: e.target.value })} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
              <option value="">Frecvență udare</option>
              <option value="1/săpt">1 dată pe săptămână</option>
              <option value="2/săpt">2 ori pe săptămână</option>
              <option value="zilnic">Zilnic</option>
            </select>
            <select value={form.light} onChange={(e) => setForm({ ...form, light: e.target.value })} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
              <option value="">Nivel lumină</option>
              <option value="scăzut">Scăzut</option>
              <option value="moderat">Moderat</option>
              <option value="ridicat">Ridicat</option>
            </select>
            <select value={form.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
              <option value="">Temperatură optimă</option>
              <option value="scăzută">Scăzută</option>
              <option value="medie">Medie</option>
              <option value="ridicată">Ridicată</option>
            </select>
            <select value={form.airHumidity} onChange={(e) => setForm({ ...form, airHumidity: e.target.value })} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
              <option value="">Umiditate aer</option>
              <option value="scăzută">Scăzută</option>
              <option value="moderată">Moderată</option>
              <option value="ridicată">Ridicată</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 py-2 px-4 rounded text-white ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isLoading ? "Se salvează..." : editingPlantId ? "Salvează modificările" : "Adaugă planta"}
          </button>
        </form>

        <h2 className="text-2xl font-semibold text-green-700 dark:text-green-300 mt-8 mb-4">🌱 Plantele mele</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {userData?.plants?.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              sensorData={sensorData}
              onWater={handleWaterPlant}
              isWatering={isWatering}
              history={history}
              onEdit={handleEditPlant}
              onDelete={handleDeletePlant}
            />
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 mt-6">
          <h2 className="text-xl font-semibold mb-2">Setează orașul pentru vreme</h2>
          <form onSubmit={handleCityChange} className="flex gap-2">
            <input name="city" defaultValue={userData?.city || ""} placeholder="ex: Cluj-Napoca" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600" />
            <button type="submit" className="bg-green-600 text-white px-4 rounded hover:bg-green-700">Salvează</button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Vremea ({userData?.city || "–"})</h2>
          <p>🌡️ Temperatură: {weather.temp ?? "–"} °C</p>
          <p>☁️ Condiții: {weather.desc ?? "–"}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
