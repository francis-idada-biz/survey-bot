import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../utils/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token");
    if (!t) {
      setError("No reset token provided.");
    }
    setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/auth/reset-password", { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center space-y-4">
        <h2 className="text-2xl font-semibold text-green-600">Password Reset Successful!</h2>
        <p className="text-slate-700">You can now log in with your new password.</p>
        <Link to="/login" className="inline-block bg-blue-700 text-white px-5 py-3 rounded-md hover:bg-blue-800">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Reset Your Password</h2>
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-slate-50 border border-slate-300 rounded-lg shadow-sm space-y-4"
      >
        {error && <div className="p-3 bg-red-100 text-red-800 rounded-md text-center">{error}</div>}
        <div>
          <label className="text-slate-700 font-medium">New Password</label>
          <div className="relative mt-1">
            <input
              type={newPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-slate-300 rounded-md"
            />
            <button
              type="button"
              onClick={() => setNewPasswordVisible(!newPasswordVisible)}
              className="absolute inset-y-0 right-0 px-4 py-2 m-1 bg-slate-200 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 z-10"
            >
              {newPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Password must be at least 8 characters long and contain an uppercase letter, a number, and a special character (!@#$%^&*).
          </p>
        </div>
        <div>
          <label className="text-slate-700 font-medium">Confirm New Password</label>
          <div className="relative mt-1">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-slate-300 rounded-md"
            />
            <button
              type="button"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              className="absolute inset-y-0 right-0 px-4 py-2 m-1 bg-slate-200 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 z-10"
            >
              {confirmPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full bg-blue-700 disabled:bg-slate-400 text-white py-3 rounded-md hover:bg-blue-800"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
