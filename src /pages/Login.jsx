// Importă hook-uri React
import React, { useState, useEffect } from "react";

// Importă funcții pentru autentificare Firebase
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

// Instanțele configurate de Firebase
import { auth, googleProvider, db } from "../services/firebase";

// Navigare și linkuri interne
import { useNavigate, Link } from "react-router-dom";

// Pentru mesaje toast
import { toast } from "react-toastify";

// Funcții Firestore
import { doc, getDoc, setDoc } from "firebase/firestore";

// Componenta Login
const Login = () => {
  // Stare pentru formularul de login (email/parolă)
  const [form, setForm] = useState({ email: "", password: "" });

  // Stare pentru a indica dacă se face login
  const [loading, setLoading] = useState(false);

  // Stări pentru modalul de resetare parolă
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Navigare programatică
  const navigate = useNavigate();

  // Login cu email și parolă
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      // Verifică dacă utilizatorul și-a verificat emailul
      if (!user.emailVerified) {
        toast.error("Confirmă adresa de email înainte de autentificare!");
        await auth.signOut();
        setLoading(false);
        return;
      }

      toast.success("Autentificare reușită!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Email sau parolă incorectă!");
    }
    setLoading(false);
  };

  // Login cu cont Google + inițializare document Firestore dacă lipsește
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // Creează documentul doar dacă nu există
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          plants: [],
          city: "",
        });
      }

      navigate("/dashboard");
    } catch (err) {
      toast.error("Eroare la autentificarea cu Google");
    }
  };

  // Trimite email de resetare a parolei
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return toast.error("Introdu un email valid.");

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Email de resetare trimis!");
      setShowResetModal(false);
      setResetEmail("");
    } catch (err) {
      toast.error("Email invalid sau inexistent.");
    }
  };

  // Închide modalul dacă utilizatorul apasă ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowResetModal(false);
      }
    };

    if (showResetModal) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showResetModal]);

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center relative">
      {/* Formular principal */}
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-green-700">
          Autentificare
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        {/* Parolă */}
        <input
          type="password"
          placeholder="Parolă"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        {/* Buton login */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 text-white rounded mb-3 ${
            loading
              ? "bg-gray-400"
              : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
          }`}
        >
          {loading ? "Se conectează..." : "Autentifică-te"}
        </button>

        {/* Link resetare parolă */}
        <p
          onClick={() => setShowResetModal(true)}
          className="mt-2 text-center text-sm text-blue-600 hover:underline cursor-pointer"
        >
          Ai uitat parola?
        </p>

        {/* Separator vizual */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">sau</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Buton Google login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center w-full justify-center gap-3 px-4 py-2 mb-3 rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-sm font-medium shadow-sm transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-5 h-5"
          />
          <span>Continuă cu Google</span>
        </button>

        {/* Link către înregistrare */}
        <p className="text-center mt-3 text-sm">
          Nu ai cont?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Creează un cont
          </Link>
        </p>
      </form>

      {/* Modal resetare parolă */}
      {showResetModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Resetare parolă
            </h3>
            <form onSubmit={handleResetPassword}>
              <input
                type="email"
                placeholder="Emailul tău"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Trimite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
