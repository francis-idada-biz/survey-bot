import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "./components/Login";
import Logout from "./components/Logout";
import Dashboard from "./components/Dashboard";
import StartEvaluation from "./components/StartEvaluation";
import EvaluationChat from "./components/EvaluationChat";
import ProtectedRoute from "./router/ProtectedRoute";
import { AuthProvider, AuthContext } from "./context/AuthContext"; // Import the provider
import { useContext } from "react";

export default function App() {
  return (
    <BrowserRouter>
      {/* 1. Wrap the entire app in AuthProvider */}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  // 2. Now useAuth (via useContext) will work correctly
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Hide nav ONLY on login page
  const hideNav = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-4xl bg-white min-h-screen shadow-md border-x border-slate-300">

        {/* TOP NAV */}
        {!hideNav && (
          <div className="w-full p-4 border-b bg-slate-50 border-slate-300 flex justify-between items-center sticky top-0 z-10">
            <h1 className="text-xl font-semibold text-slate-800">
              Medical Evaluation System
            </h1>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
                  {user.email} ({user.role})
                </span>
                <a
                  href="/logout"
                  className="text-sm text-red-600 hover:underline font-medium"
                >
                  Logout
                </a>
              </div>
            ) : (
              <div />
            )}
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="p-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/start-evaluation"
              element={
                <ProtectedRoute>
                  <StartEvaluation />
                </ProtectedRoute>
              }
            />

            <Route
              path="/evaluation/:evaluation_id"
              element={
                <ProtectedRoute>
                  <EvaluationChat />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

      </div>
    </div>
  );
}