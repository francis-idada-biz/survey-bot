import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const nav = useNavigate();
  const { checkUser } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async () => {
    setIsSubmitting(true);
    setErr("");
    
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      await checkUser();
      nav("/");
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.error || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') login();
  };

  return (
    /* FIX: Using standard colors (slate-900, blue-600) instead of custom 'brand' colors 
       to ensure the background renders correctly.
    */
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black -m-6">
      
      <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl">
        
        {/* Animated background blobs using standard colors */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="relative">
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-slate-300 mb-8">Enter your credentials to access the Evaluation Bot</p>

          {err && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-md text-sm text-center mb-6">
              {err}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="name@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <button
              onClick={login}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}