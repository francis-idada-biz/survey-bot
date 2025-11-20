import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "./components/Login";
import Logout from "./components/Logout";
import Dashboard from "./components/Dashboard";
import StartEvaluation from "./components/StartEvaluation";
import EvaluationChat from "./components/EvaluationChat";
import ProtectedRoute from "./router/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  // Hide nav ONLY on login page
  const hideNav = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-4xl bg-white min-h-screen shadow-md border-x border-slate-300">

        {/* TOP NAV */}
        {!hideNav && (
          <div className="w-full p-4 border-b bg-slate-50 border-slate-300 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-slate-800">
              Medical Evaluation System
            </h1>

            {user ? (
              <a
                href="/logout"
                className="text-blue-700 hover:underline font-medium"
              >
                Logout
              </a>
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
