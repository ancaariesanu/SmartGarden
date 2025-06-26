// Importă React (necesar pentru componente funcționale)
import React from "react";

// Componenta ConfirmWaterModal primește 3 props: planta, funcția de confirmare și de anulare
const ConfirmWaterModal = ({ plant, onConfirm, onCancel }) => {
  return (
    // Overlay întunecat care acoperă întreaga fereastră (semi-transparent)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      
      {/* Cutia modală albă, centrată */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
        
        {/* Titlul ferestrei de confirmare */}
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Confirmare udare
        </h2>

        {/* Mesajul de întrebare cu numele plantei */}
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Sigur vrei să uzi planta <strong>{plant.name}</strong>?
        </p>

        {/* Butoane de acțiune: Anulează și Udă */}
        <div className="flex justify-end space-x-2">
          {/* Butonul pentru a anula acțiunea */}
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Anulează
          </button>

          {/* Butonul care confirmă udarea */}
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Udă
          </button>
        </div>
      </div>
    </div>
  );
};

// Exportă componenta pentru a fi folosită în alte fișiere
export default ConfirmWaterModal;
