import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
  // State pentru datele din formularul de înregistrare
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // State pentru afișarea loading-ului și modalului de confirmare
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const navigate = useNavigate();

  // Închide modalul de confirmare la apăsarea tastei ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowConfirmModal(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Funcția care gestionează înregistrarea unui nou utilizator
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Verifică dacă parolele coincid
    if (form.password !== form.confirmPassword) {
      toast.error("Parolele nu coincid!");
      setLoading(false);
      return;
    }

    try {
      // Creează utilizatorul în Firebase Authentication
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      // Trimite email de verificare
      await sendEmailVerification(user);
      // Creează document în Firestore pentru utilizator, cu setări inițiale
      await setDoc(doc(db, "users", user.uid), {
        email: form.email,
        plants: [],
        city: "", // Va fi setat ulterior automat dacă se dorește
      });

      // Afișează modalul de confirmare a creării contului
      setShowConfirmModal(true);
      // Resetează formularul
      setForm({ email: "", password: "", confirmPassword: "" });
    } catch (err) {
      toast.error("Eroare la înregistrare.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center relative">
      {/* Formularul de înregistrare */}
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-700">Înregistrare</h2>

        {/* Input pentru email */}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        {/* Input pentru parolă */}
        <input
          type="password"
          placeholder="Parolă"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        {/* Input pentru confirmarea parolei */}
        <input
          type="password"
          placeholder="Reintrodu parola"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        {/* Butonul de submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 text-white rounded ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Se creează..." : "Creează cont"}
        </button>

        {/* Link către pagina de login */}
        <p className="text-center mt-3 text-sm">
          Ai deja cont?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Autentifică-te
          </Link>
        </p>
      </form>

      {/* Modal confirmare email */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center"
            onClick={(e) => e.stopPropagation()} // Previne închiderea modalului la click în interior
          >
            <h3 className="text-lg font-semibold mb-3 text-green-700">✅ Cont creat cu succes!</h3>
            <p className="text-gray-700 mb-4">
              Verifică adresa de email pentru a confirma contul. După confirmare te poți autentifica.
            </p>
            <button
              onClick={() => {
                setShowConfirmModal(false);
                navigate("/login");
              }}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Mergi la autentificare
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
