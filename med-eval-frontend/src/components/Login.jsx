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
  const [passwordVisible, setPasswordVisible] = useState(false);

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

          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type={passwordVisible ? "text" : "password"}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {passwordVisible ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.981 8.75C4.45 10.007 4.995 11.22 5.606 12.374M10.412 5.593C11.007 5.222 11.66 5 12.333 5c1.982 0 3.833.99 4.981 2.625.526.725.955 1.506 1.282 2.34M17.25 12.375c.327.834.756 1.615 1.282 2.34 1.148 1.635 3.001 2.625 4.981 2.625-1.982 0-3.833-.99-4.981-2.625a13.43 13.43 0 0 1-1.282-2.34M3.981 8.75L2.25 10.5M17.25 12.375L19.5 14.25M3.981 8.75C2.833 6.12 4.981 3.5 7.5 3.5c2.519 0 4.667 2.62 5.815 5.25m-5.815 0a1.5 1.5 0 0 0-2.333 2.333m2.333-2.333a1.5 1.5 0 0 1 2.333 2.333m0 0a1.5 1.5 0 0 1-2.333 2.333m2.333-2.333a1.5 1.5 0 0 0 2.333-2.333m0 0c1.148-2.63 3.3-5.25 5.815-5.25 2.519 0 4.667 2.62 5.815 5.25m-5.815 0a1.5 1.5 0 0 0-2.333 2.333" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </button>
            <div className="text-right">
              <a href="/request-password-reset" className="text-sm text-slate-400 hover:text-white hover:underline">Forgot Password?</a>
            </div>
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
  );
}