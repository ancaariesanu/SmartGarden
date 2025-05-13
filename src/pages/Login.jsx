import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      toast.success("Autentificare reușită!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Email sau parolă incorectă!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-700">Autentificare</h2>
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
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 text-white rounded ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
        >
          {loading ? "Se conectează..." : "Autentifică-te"}
        </button>
      </form>
    </div>
  );
};

export default Login;
