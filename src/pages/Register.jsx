import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
  const [form, setForm] = useState({ email: "", password: "", confirm: "", city: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (form.password !== form.confirm) {
      toast.error("Parolele nu se potrivesc.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: form.email,
        city: form.city,
        plants: [],
      });
      toast.success("Cont creat cu succes!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Eroare la creare cont.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-700">Înregistrare</h2>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Parolă"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirmă parola"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Oraș (pentru vreme)"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 text-white rounded ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
        >
          {loading ? "Se creează cont..." : "Creează cont"}
        </button>
      </form>
    </div>
  );
};

export default Register;
