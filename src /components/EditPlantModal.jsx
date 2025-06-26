// Importă React și hook-urile necesare
import React, { useEffect, useState } from "react";
// Importă componenta de selectare cu sugestii
import Select from "react-select";
// Importă lista de plante comune
import commonPlants from "../data/commonPlants";

// Componentă modală pentru editarea unei plante
const EditPlantModal = ({ plant, onClose, onSave }) => {
  // Inițializează formularul cu datele plantei existente
  const [form, setForm] = useState({ ...plant });

  // Închide modalul dacă utilizatorul apasă ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Trimite datele salvate în componenta părinte
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  // Gestionează încărcarea imaginii (convertită în base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imageBase64: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    // Overlay întunecat, centrat pe ecran
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Containerul modalului */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xl relative overflow-y-auto max-h-[90vh]">
        
        {/* Buton închidere (X) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
          aria-label="Închide"
        >
          &times;
        </button>

        {/* Titlul modalului */}
        <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-300">
          Editează planta
        </h2>

        {/* Formular pentru actualizarea datelor */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sugestie plantă din lista comună */}
          <div>
            <label className="block font-medium mb-1">Sugestie plantă</label>
            <Select
              options={commonPlants}
              placeholder="Caută o plantă..."
              defaultValue={commonPlants.find((p) => p.label === plant.name)}
              onChange={(selected) => {
                if (!selected) return;
                // Actualizează formularul cu datele din sugestie
                setForm({
                  ...form,
                  name: selected.label,
                  waterFreq: selected.waterFreq,
                  light: selected.light,
                  temp: selected.temp,
                  airHumidity: selected.airHumidity,
                });
              }}
              className="text-black"
            />
          </div>

          {/* Câmpuri dinamice: nume, udare, lumină etc. */}
          {["name", "waterFreq", "light", "temp", "airHumidity"].map((field) => (
            <div key={field}>
              <label className="block mb-1 font-medium capitalize">
                {field === "waterFreq"
                  ? "Frecvență udare"
                  : field === "airHumidity"
                  ? "Umiditate aer"
                  : field === "name"
                  ? "Nume plantă"
                  : field === "temp"
                  ? "Temperatură optimă"
                  : field === "light"
                  ? "Nivel lumină"
                  : field}
              </label>
              {/* Select pentru câmpuri prestabilite, input pentru nume */}
              {["waterFreq", "light", "temp", "airHumidity"].includes(field) ? (
                <select
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Selectează</option>
                  {field === "waterFreq" &&
                    ["1/săpt", "2/săpt", "3/săpt", "zilnic"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  {field === "light" &&
                    ["scăzut", "moderat", "ridicat"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  {field === "temp" &&
                    ["scăzută", "medie", "ridicată"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  {field === "airHumidity" &&
                    ["scăzută", "moderată", "ridicată"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              )}
            </div>
          ))}

          {/* Select pentru interior / exterior */}
          <div>
            <label className="block mb-1 font-medium">Tip plantă</label>
            <select
              value={form.locationType || ""}
              onChange={(e) => setForm({ ...form, locationType: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Selectează tipul</option>
              <option value="indoor">Interior</option>
              <option value="outdoor">Exterior</option>
            </select>
          </div>

          {/* Upload imagine (salvată ca base64) */}
          <div>
            <label className="block mb-1 font-medium">Imagine (opțional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            {/* Previzualizare imagine dacă e deja salvată */}
            {form.imageBase64 && (
              <img
                src={form.imageBase64}
                alt="Preview"
                className="mt-2 h-32 object-cover rounded"
              />
            )}
          </div>

          {/* Câmp cod dispozitiv - util pentru asociere cu senzor fizic */}
          <div>
            <label className="block mb-1 font-medium">Cod dispozitiv (opțional)</label>
            <input
              type="text"
              value={form.deviceCode || ""}
              onChange={(e) => setForm({ ...form, deviceCode: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="ex: ESP123456"
            />
          </div>

          {/* Buton final de salvare */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
          >
            Salvează modificările
          </button>
        </form>
      </div>
    </div>
  );
};

// Exportă componenta
export default EditPlantModal;
