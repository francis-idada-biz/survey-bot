import React, { useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";

export default function RequestPasswordReset() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      await api.post("/api/auth/request-password-reset", { email });
      setFeedback({
        type: "success",
        message: "If an account with this email exists, a password reset link has been sent.",
      });
    } catch (error) {
      // For security, show the same message for success and failure
      setFeedback({
        type: "success",
        message: "If an account with this email exists, a password reset link has been sent.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Reset Password</h2>
      {feedback ? (
        <div className="p-4 bg-green-100 text-green-800 rounded-md text-center">
          <p>{feedback.message}</p>
          <Link to="/login" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-slate-50 border border-slate-300 rounded-lg shadow-sm space-y-4"
        >
          <p className="text-slate-600">
            Enter your email address and we will send you a link to reset your password.
          </p>
          <div>
            <label htmlFor="email" className="text-slate-700 font-medium">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-slate-300 rounded-md mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 disabled:bg-slate-400 text-white py-3 rounded-md hover:bg-blue-800"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </div>
  );
}
