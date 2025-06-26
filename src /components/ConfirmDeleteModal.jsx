import React from "react";

// Componentă modală pentru confirmarea ștergerii unei plante
// Primește planta care urmează să fie ștearsă și două funcții callback:
// - onConfirm: se apelează când utilizatorul confirmă ștergerea
// - onCancel: se apelează când utilizatorul anulează operațiunea
const ConfirmDeleteModal = ({ plant, onConfirm, onCancel }) => {
  return (
    // Overlay semi-transparent care acoperă întreaga pagină
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {/* Containerul ferestrei modale, cu stilizare pentru modul normal și dark */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
        {/* Titlul modalului */}
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Confirmare ștergere
        </h2>
        {/* Textul care întreabă utilizatorul dacă este sigur că vrea să șteargă planta */}
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Sigur vrei să ștergi planta <strong>{plant.name}</strong>?
        </p>
        {/* Butoanele de acțiune: Anulează și Șterge */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel} // Anulează ștergerea
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Anulează
          </button>
          <button
            onClick={onConfirm} // Confirmă ștergerea plantei
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            Șterge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
