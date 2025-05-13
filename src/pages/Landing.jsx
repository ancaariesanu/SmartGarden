import React from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center space-y-6 w-80">
        <h1 className="text-3xl font-bold text-green-700">SmartGarden</h1>
        <p className="text-gray-600">Bine ai venit! Alege o acțiune:</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/login")}
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
          >
            Înregistrare
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
