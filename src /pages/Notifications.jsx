// React și hook-uri
import React, { useEffect, useState } from "react";

// Firebase Realtime Database
import { ref, onValue, remove } from "firebase/database";
import { auth, realtimeDb } from "../services/firebase";

// Componenta Navbar și notificări toast
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

// Componenta principală pentru afișarea notificărilor
const Notifications = () => {
  const [notifications, setNotifications] = useState([]); // Lista de notificări
  const [loading, setLoading] = useState(true);           // Stare de încărcare

  const uid = auth.currentUser?.uid;                      // UID-ul utilizatorului curent

  // Efect: ascultă notificările din baza de date realtime
  useEffect(() => {
    if (!uid) return;

    const notifPath = `realtime_data/${uid}`;             // Calea către datele utilizatorului
    const rootRef = ref(realtimeDb, notifPath);           // Referință Firebase

    onValue(rootRef, (snapshot) => {
      const data = snapshot.val();                        // Datele brute
      if (!data) return;

      const allNotifs = [];

      // Parcurge fiecare plantă
      Object.entries(data).forEach(([plantId, plantData]) => {
        const notifList = plantData.notifications || {};

        // Parcurge notificările fiecărei plante
        Object.entries(notifList).forEach(([id, notif]) => {
          allNotifs.push({
            ...notif,
            plantId,
            id,
          });
        });
      });

      // Sortează notificările descrescător după timp
      setNotifications(allNotifs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
      setLoading(false);
    });
  }, [uid]);

  // Șterge toate notificările cu confirmare
  const handleClear = async () => {
    if (!uid) return;
    const confirm = window.confirm("Ești sigur că vrei să ștergi toate notificările?");
    if (!confirm) return;

    const notifPath = `realtime_data/${uid}`;
    const rootRef = ref(realtimeDb, notifPath);

    onValue(
      rootRef,
      async (snapshot) => {
        const data = snapshot.val();

        for (const plantId in data) {
          if (data[plantId]?.notifications) {
            await remove(ref(realtimeDb, `realtime_data/${uid}/${plantId}/notifications`));
          }
        }

        toast.success("Notificările au fost șterse.");
      },
      { onlyOnce: true }
    );
  };

  return (
    <div className="bg-green-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-300">
          🔔 Istoric notificări
        </h1>

        {/* Afișare în funcție de starea de încărcare și conținut */}
        {loading ? (
          <p>Se încarcă notificările...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Nu există notificări salvate.</p>
        ) : (
          <>
            <ul className="space-y-3 mb-6">
              {notifications.map((n, idx) => (
                <li
                  key={idx}
                  className="p-4 bg-white dark:bg-gray-800 rounded shadow border-l-4 border-green-500"
                >
                  {/* Informații despre plantă și tipul notificării */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Planta ID: <strong>{n.plantId}</strong> | {n.timestamp?.replace("T", " ")}
                    </div>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded font-medium ${
                        n.type === "manual_watering"
                          ? "bg-blue-200 text-blue-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {n.type === "manual_watering" ? "Udare manuală" : "Udare automată"}
                    </span>
                  </div>

                  {/* Mesajul notificării */}
                  <div className="font-medium mt-1">{n.message}</div>
                </li>
              ))}
            </ul>

            {/* Buton de ștergere */}
            <button
              onClick={handleClear}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Șterge toate notificările
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
