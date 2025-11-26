import React, { useState } from "react";
import api from "../utils/api";

export default function Invite() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      await api.post("/api/users/invite", { email, role });
      setFeedback({ type: "success", message: `Invitation sent to ${email}` });
      setEmail("");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.error || "Failed to send invitation",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Invite User</h2>
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-slate-50 border border-slate-300 rounded-lg shadow-sm space-y-4"
      >
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
        <div>
          <label htmlFor="role" className="text-slate-700 font-medium">
            Role
          </label>
          <select
            id="role"
            className="w-full p-3 border border-slate-300 rounded-md mt-1 bg-white"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="evaluator">Evaluator</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 disabled:bg-slate-400 text-white py-3 rounded-md hover:bg-blue-800"
        >
          {loading ? "Sending..." : "Send Invitation"}
        </button>
        {feedback && (
          <div
            className={`p-3 rounded-md text-center ${
              feedback.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </form>
    </div>
  );
}
