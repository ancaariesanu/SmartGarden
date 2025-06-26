import React from "react";
import { useNavigate } from "react-router-dom"; // Pentru navigare programatică

// Pagina de prezentare (landing page)
const Landing = () => {
  const navigate = useNavigate(); // Hook pentru redirect

  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col justify-center items-center p-6">
      
      {/* Titlu aplicație */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-700 dark:text-green-300 text-center">
        SmartGarden 🌿
      </h1>

      {/* Subtitlu / Slogan */}
      <p className="text-lg md:text-xl text-center max-w-xl mb-8 text-gray-600 dark:text-gray-300">
        Monitorizează-ți plantele inteligent. Vezi starea lor în timp real, udă-le de la distanță și bucură-te de o grădină fericită!
      </p>

      {/* Imagine ilustrativă */}
      <img
        src="https://cdn-icons-png.flaticon.com/512/1892/1892751.png"
        alt="Plant icon"
        className="w-40 md:w-56 mb-10"
      />

      {/* Butonul principal: redirect către login */}
      <button
        onClick={() => navigate("/login")}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition text-lg"
      >
        Începe acum
      </button>

      {/* Beneficii prezentate în 3 carduri */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-5xl mx-auto">
        
        {/* Card 1 - Monitorizare live */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">📡 Monitorizare live</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Primiți date în timp real despre umiditatea solului și condițiile de mediu ale plantelor.
          </p>
        </div>

        {/* Card 2 - Udare automată */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">💧 Udare automată</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Udați planta de la distanță cu un singur click din aplicație, fără să vă faceți griji.
          </p>
        </div>

        {/* Card 3 - Acces multiplatformă */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">📱 Acces de oriunde</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Interfață modernă, compatibilă mobil/desktop, accesibilă oricând din browser.
          </p>
        </div>
      </div>

      {/* Footer simplu */}
      <p className="text-sm mt-12 text-gray-500 dark:text-gray-400">
        &copy; 2025 SmartGarden. Dezvoltat cu 🌱 de Anca-Andreea Arieșanu.
      </p>
    </div>
  );
};

export default Landing;
