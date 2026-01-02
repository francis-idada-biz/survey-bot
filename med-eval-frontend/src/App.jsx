import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Link, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Logout from "./components/Logout";
import Dashboard from "./components/Dashboard";
import StartEvaluation from "./components/StartEvaluation";
import EvaluationChat from "./components/EvaluationChat";
import Invite from "./components/Invite";
import Register from "./components/Register";
import UserManagement from "./components/UserManagement";
import CreateAdmin from "./components/CreateAdmin";
import Profile from "./components/Profile";
import RequestPasswordReset from "./components/RequestPasswordReset";
import ResetPassword from "./components/ResetPassword";
import ProtectedRoute from "./router/ProtectedRoute";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Check if we're on a public page
  const publicPaths = ["/login", "/register", "/request-password-reset", "/reset-password"];
  const isPublicPath = publicPaths.some(path => location.pathname.startsWith(path));

  // Render public pages with special layout
  if (isPublicPath) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex justify-center items-center font-sans text-white">
        <div className="w-full max-w-md">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/request-password-reset" element={<RequestPasswordReset />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </div>
      </div>
    );
  }

  // Main app layout for protected routes
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-4xl bg-white min-h-screen shadow-md border-x border-slate-300">

        {/* TOP NAV */}
        <div className="w-full p-4 border-b bg-slate-50 border-slate-300 flex justify-between items-center sticky top-0 z-10">
          <Link to="/profile" className="text-xl font-semibold text-slate-800">
            Medical Evaluation System
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'power_user' && (
                <Link to="/user-management" className="text-sm text-blue-600 hover:underline">User Management</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/invite" className="text-sm text-blue-600 hover:underline">Invite User</Link>
              )}
              <span className="text-sm text-slate-500">
                {user.email} ({user.role})
              </span>
              <Link
                to="/logout"
                className="text-sm text-red-600 hover:underline font-medium"
              >
                Logout
              </Link>
            </div>
          ) : null}
        </div>

        {/* MAIN CONTENT */}
        <div className="p-6">
          <Routes>
            {/* Public route for logout */}
            <Route path="/logout" element={<Logout />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
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
            
            <Route
              path="/invite"
              element={
                <ProtectedRoute>
                  <Invite />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user-management"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/:user_id"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-admin"
              element={
                <ProtectedRoute>
                  <CreateAdmin />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route - redirect to login if not authenticated, otherwise to dashboard */}
            <Route path="*" element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
          </Routes>
        </div>

      </div>
    </div>
  );
}
