import React, { useEffect, useState, useRef } from "react";
import { auth, db, realtimeDb } from "../services/firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, onValue, set } from "firebase/database";
import Navbar from "../components/Navbar";
import PlantCard from "../components/PlantCard";
import EditPlantModal from "../components/EditPlantModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ConfirmWaterModal from "../components/ConfirmWaterModal";
import { toast } from "react-toastify";
import Select from "react-select";
import commonPlants from "../data/commonPlants";

const Dashboard = () => {
  // Stări pentru datele utilizatorului, senzor, istoric, editare, modale, formular etc.
  const [userData, setUserData] = useState(null);
  const [sensorDataByPlant, setSensorDataByPlant] = useState({});
  const [history, setHistory] = useState([]);
  const [editingPlant, setEditingPlant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [weather, setWeather] = useState({});
  const [form, setForm] = useState({
    name: "",
    waterFreq: "",
    light: "",
    temp: "",
    airHumidity: "",
    locationType: "",
  });
  const [plantToDelete, setPlantToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [plantToWater, setPlantToWater] = useState(null);


  // ID-ul utilizatorului curent
  const uid = auth.currentUser?.uid;
  const lastNotificationRef = useRef({});

  // Fetch date utilizator din Firestore la montare sau când uid se schimbă
  useEffect(() => {
    if (!uid) return;
    const fetchUserData = async () => {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setUserData(docSnap.data());
    };
    fetchUserData();
  }, [uid]);

  // Detectare locație user și actualizare oraș în Firestore
  useEffect(() => {
    if (!uid) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const data = await res.json();
      const city = data.address.city || data.address.town || data.address.village || "Nespecificat";

      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, { city });
      setUserData((prev) => ({ ...prev, city }));
    });
  }, [uid]);

  // Fetch vreme în funcție de orașul utilizatorului
  useEffect(() => {
    if (!userData?.city) return;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${userData.city}&appid=c0a00779dd0d1f198c1d7d118695fad3&units=metric`)
      .then(res => res.json())
      .then(data => {
        setWeather({
          temp: data.main.temp,
          desc: data.weather[0].description,
        });
      })
      .catch(() => toast.error("Nu am putut obține vremea."));
  }, [userData]);

  // Ascultă datele senzorilor pentru fiecare plantă în timp real
  useEffect(() => {
    if (!uid || !userData?.plants) return;

    const thresholds = {
      temp: {
        scăzută: [0, 18],
        medie: [18, 25],
        ridicată: [25, 35],
      },
      airHumidity: {
        scăzută: [0, 40],
        moderată: [40, 60],
        ridicată: [60, 100],
      },
      light: {
        scăzut: [0, 300],
        moderat: [300, 800],
        ridicat: [800, 2000],
      },
    };

    const deduceSoilThreshold = (freq) => {
      return {
        "zilnic": 60,
        "3/săpt": 50,
        "2/săpt": 40,
        "1/săpt": 30,
      }[freq] || 35;
    };

    const listeners = userData.plants.map((plant) => {
      const sensorRef = ref(realtimeDb, `realtime_data/${uid}/${plant.id}/sensors`);

      return onValue(sensorRef, (snapshot) => {
        const allData = snapshot.val();
        if (!allData || Object.keys(allData).length === 0) {
          setSensorDataByPlant((prev) => ({
            ...prev,
            [plant.id]: {
              airTemperature: null,
              airHumidity: null,
              soilMoisture: null,
              lightLevel: null,
            },
          }));
          return;
        }

        const lastKey = Object.keys(allData).sort().pop();
        const lastReading = allData[lastKey] || {};

        const formattedData = {
          airTemperature: lastReading.Temperature ?? null,
          airHumidity: lastReading.Humidity ?? null,
          soilMoisture: lastReading.SoilMoisture ?? null,
          lightLevel: lastReading.LightLevel ?? null,
        };

        setSensorDataByPlant((prev) => ({
          ...prev,
          [plant.id]: formattedData,
        }));

        const sensorValues = {
          temp: formattedData.airTemperature,
          airHumidity: formattedData.airHumidity,
          light: formattedData.lightLevel,
          soilMoisture: formattedData.soilMoisture,
        };

        const plantPref = {
          temp: plant.temp,
          airHumidity: plant.airHumidity,
          light: plant.light,
          waterFreq: plant.waterFreq,
        };

        const now = Date.now();
        const notifyOncePerHour = (key) => {
          const last = lastNotificationRef.current[key] || 0;
          if (now - last > 3600000) {
            lastNotificationRef.current[key] = now;
            return true;
          }
          return false;
        };

        const mismatchToast = (param, val, expectedLabel) => {
          const range = thresholds[param]?.[expectedLabel];
          if (!range || val === undefined || val === null) return;
          const [min, max] = range;
          if (val < min || val > max) {
            const label = param === "temp" ? "Temperatura" :
                          param === "airHumidity" ? "Umiditatea aerului" :
                          "Lumina";
            const toastKey = `${plant.id}_${param}`;
            if (notifyOncePerHour(toastKey)) {
              toast.warning(`⚠️ ${label} pentru planta "${plant.name}" este în afara intervalului ${min}-${max}. Valoare actuală: ${val}`);
            }
          }
        };

        ["temp", "airHumidity", "light"].forEach((param) => {
          mismatchToast(param, sensorValues[param], plantPref[param]);
        });

        const soilThresh = deduceSoilThreshold(plantPref.waterFreq);
        if (sensorValues.soilMoisture !== null && sensorValues.soilMoisture < soilThresh) {
          const toastKey = `${plant.id}_soilMoisture`;
          if (notifyOncePerHour(toastKey)) {
            toast.warning(`🌱 Umiditatea solului pentru planta "${plant.name}" este prea mică (${sensorValues.soilMoisture}%) față de pragul de ${soilThresh}%.`);
          }
        }
      });
    });

    return () => {
      listeners.forEach((unsubscribe) => unsubscribe());
    };
  }, [uid, userData?.plants]);


  // Exemplu de ascultare a istoricului (aici doar pentru prima plantă)
  useEffect(() => {
    if (!uid || !userData?.plants) return;

    const firstPlantId = userData.plants[0]?.id;
    if (!firstPlantId) return;

    const historyRef = ref(realtimeDb, `realtime_data/${uid}/${firstPlantId}/history`);
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
  }, [uid, userData?.plants]);

  // Adaugă plantă nouă
  const handleAddPlant = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Validare completare câmpuri obligatorii
    if (!form.name || !form.waterFreq || !form.light || !form.temp || !form.airHumidity || !form.locationType) {
      toast.error("Toate câmpurile sunt obligatorii!");
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    const existing = docSnap.data()?.plants || [];

    const plant = {
      id: "plant" + Date.now(),
      ...form,
    };

    const updatedPlants = [...existing, plant];
    await updateDoc(docRef, { plants: updatedPlants });
    setUserData((prev) => ({ ...prev, plants: updatedPlants }));

    toast.success("Planta a fost adăugată!");
    setForm({ name: "", waterFreq: "", light: "", temp: "", airHumidity: "", locationType: "" });
    setIsLoading(false);
  };

  // Deschide modalul de editare pentru plantă
  const handleEditPlant = (plant) => {
    setEditingPlant(plant);
    setIsModalOpen(true);
  };

  // Salvează modificările făcute în modalul de editare
  const handleSaveEdit = async (updatedPlant) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    const updatedPlants = (docSnap.data()?.plants || []).map((p) =>
      p.id === updatedPlant.id ? updatedPlant : p
    );

    await updateDoc(docRef, { plants: updatedPlants });
    setUserData((prev) => ({ ...prev, plants: updatedPlants }));
    toast.success("Planta a fost modificată!");
    setIsModalOpen(false);
  };

  // Solicită confirmare ștergere plantă
  const handleDeleteRequest = (plant) => {
    setPlantToDelete(plant);
    setShowDeleteModal(true);
  };

  // Confirmă și execută ștergerea plantei
  const confirmDeletePlant = async () => {
    if (!plantToDelete) return;

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    const filtered = (docSnap.data()?.plants || []).filter((p) => p.id !== plantToDelete.id);
    await updateDoc(docRef, { plants: filtered });
    setUserData((prev) => ({ ...prev, plants: filtered }));
    toast.success(`Planta "${plantToDelete.name}" a fost ștearsă.`);
    setShowDeleteModal(false);
    setPlantToDelete(null);
  };

  // Trimite comanda către senzor să ude planta
  const handleWaterPlant = (plantId) => {
    const plant = userData.plants.find((p) => p.id === plantId);
    if (!plant.deviceCode) {
      toast.warn("Această plantă nu are un cod de dispozitiv setat.");
      return;
    }
    setPlantToWater(plant);
  }

  const confirmWaterPlant = async () => {
    if (!plantToWater) return;
    setIsWatering(true);
  
    const now = new Date().toISOString();
    const waterRef = ref(realtimeDb, `realtime_data/${uid}/${plantToWater.id}/command`);
    await set(waterRef, {
      waterPlant: true,
      timestamp: now,
    });
  
    toast.info(`Planta ${plantToWater.name} a fost udată!`);
    setTimeout(() => setIsWatering(false), 1500);
    setPlantToWater(null);
  };  

  return (
    <div className="bg-green-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-300">Dashboard</h1>

        {/* Informații utile pentru utilizator */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
          <p><strong>ℹ️ Sfat:</strong> Poți consulta eticheta plantei pentru informații despre udare, lumină și temperatură.</p>
          <p><strong>💡 Sugestie:</strong> Selectează o plantă din lista de mai jos pentru completarea automată.</p>
        </div>

        {/* Formular de adăugare plantă nouă */}
        <form onSubmit={handleAddPlant} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-3">Adaugă Plantă Nouă</h2>

          <div className="mb-4">
            <label className="block font-medium mb-1">Sugestie plantă</label>
            <Select
              options={commonPlants}
              placeholder="Caută o plantă..."
              onChange={(selected) => {
                if (!selected) return;
                setForm({
                  name: selected.label,
                  waterFreq: selected.waterFreq,
                  light: selected.light,
                  temp: selected.temp,
                  airHumidity: selected.airHumidity,
                  locationType: selected.locationType || "",
                  imageBase64: "",
                  deviceCode: "",
                });
              }}
              className="text-black"
            />
          </div>

          {/* Câmpuri de completat manual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["name", "waterFreq", "light", "temp", "airHumidity", "locationType"].map((field) => (
              <div key={field}>
                <label className="block mb-1 font-medium capitalize">
                  {field === "waterFreq" ? "Frecvență udare" :
                   field === "airHumidity" ? "Umiditate aer" :
                   field === "locationType" ? "Tip plantă" :
                   field === "name" ? "Nume plantă" :
                   field === "temp" ? "Temperatură optimă" :
                   field === "light" ? "Nivel lumină" : field}
                </label>
                {["waterFreq", "light", "temp", "airHumidity", "locationType"].includes(field) ? (
                  <select
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    <option value="">Selectează</option>
                    {field === "waterFreq" && ["1/săpt", "2/săpt", "3/săpt", "zilnic"].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    {field === "light" && ["scăzut", "moderat", "ridicat"].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    {field === "temp" && ["scăzută", "medie", "ridicată"].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    {field === "airHumidity" && ["scăzută", "moderată", "ridicată"].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    {field === "locationType" && [
                      { label: "Interior", value: "indoor" },
                      { label: "Exterior", value: "outdoor" },
                    ].map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Cod dispozitiv udare (opțional)</label>
            <input
              type="text"
              value={form.deviceCode}
              onChange={(e) => setForm({ ...form, deviceCode: e.target.value })}
              className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
              placeholder="ex: DVC1234"
            />
          </div>
          <label className="block mb-1 font-medium">Poză plantă (opțional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onloadend = () => {
                setForm((prev) => ({ ...prev, imageBase64: reader.result }));
              };
              reader.readAsDataURL(file);
            }}
            className="block w-full mb-4"
          />


          {/* Buton adăugare plantă */}
          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 py-2 px-4 rounded text-white ${isLoading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
          >
            {isLoading ? "Se salvează..." : "Adaugă planta"}
          </button>
        </form>

        {/* Lista plantelor utilizatorului */}
        <h2 className="text-2xl font-semibold text-green-700 dark:text-green-300 mt-8 mb-4">🌱 Plantele mele</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {userData?.plants?.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              sensorData={sensorDataByPlant[plant.id] || {}}
              onWater={handleWaterPlant}
              isWatering={isWatering}
              history={history}
              onEdit={() => handleEditPlant(plant)}
              onDelete={() => handleDeleteRequest(plant)}
              disableWater={!plant.deviceCode}
              disableGraph={!plant.deviceCode}
          />
          ))}
        </div>

        {/* Secțiune vreme */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mt-6">
          <h2 className="text-xl font-semibold">Vremea în {userData?.city || "–"}</h2>
          <p>🌡️ Temperatură: {weather.temp ?? "–"} °C</p>
          <p>☁️ Condiții: {weather.desc ?? "–"}</p>
        </div>

        {/* Modal editare plantă */}
        {isModalOpen && editingPlant && (
          <EditPlantModal
            plant={editingPlant}
            onSave={handleSaveEdit}
            onClose={() => setIsModalOpen(false)}
            allowImageEdit={true}
            allowDeviceCodeEdit={true}
          />
        )}

        {/* Modal confirmare ștergere plantă */}
        {showDeleteModal && plantToDelete && (
          <ConfirmDeleteModal
            plant={plantToDelete}
            onConfirm={confirmDeletePlant}
            onCancel={() => {
              setShowDeleteModal(false);
              setPlantToDelete(null);
            }}
          />
        )}

        {/* Modal confirmare udare plantă */}
        {plantToWater && (
          <ConfirmWaterModal
            plant={plantToWater}
            onConfirm={confirmWaterPlant}
            onCancel={() => setPlantToWater(null)}
          />
        )}

      </div>
    </div>
  );
};

export default Dashboard;
