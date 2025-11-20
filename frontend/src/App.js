// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import StartEvaluation from "./components/StartEvaluation";
import EvaluationChat from "./components/EvaluationChat";
import Dashboard from "./components/Dashboard"; // placeholder or real one
import Logout from "./components/Logout";

import { useAuth } from "./hooks/useAuth";

// Wrapper for protected routes
function AuthenticatedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected: Evaluators & Admins */}
        <Route
          path="/start-evaluation"
          element={
            <AuthenticatedRoute>
              <StartEvaluation />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/evaluation/:evaluation_id"
          element={
            <AuthenticatedRoute>
              <EvaluationChat />
            </AuthenticatedRoute>
          }
        />

        {/* Protected Home */}
        <Route
          path="/"
          element={
            <AuthenticatedRoute>
              <Dashboard />
            </AuthenticatedRoute>
          }
        />

        {/* Catch-all → redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
