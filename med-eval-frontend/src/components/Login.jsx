import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const nav = useNavigate();
  const { checkUser } = useAuth(); // Get the checkUser function from context
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async () => {
    setIsSubmitting(true);
    setErr("");
    
    try {
      const res = await api.post("/api/auth/login", { email, password });
      
      // 1. Save the token
      localStorage.setItem("token", res.data.token);
      
      // 2. Force the AuthContext to refresh the user data from the backend
      await checkUser();

      // 3. Navigate to home
      nav("/");
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.error || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Allow pressing "Enter" to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') login();
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-slate-200 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-slate-500 mb-6">Sign in to access evaluations</p>

        {err && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center mb-4 border border-red-200">
            {err}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="name@hospital.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            onClick={login}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}