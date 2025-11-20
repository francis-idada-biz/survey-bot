import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const login = async () => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      nav("/");
    } catch (e) {
      setErr("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="bg-white p-10 rounded-lg shadow-md border border-slate-300 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-6">
          Evaluator Login
        </h1>

        {err && <div className="text-red-600 text-center mb-4">{err}</div>}

        <div className="space-y-4">
          <div>
            <label className="text-slate-700 font-medium">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-slate-300 rounded-md mt-1"
              placeholder="name@hospital.org"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-slate-700 font-medium">Password</label>
            <input
              type="password"
              className="w-full p-3 border border-slate-300 rounded-md mt-1"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={login}
            className="w-full bg-blue-700 text-white py-3 rounded-md hover:bg-blue-800"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
