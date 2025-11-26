import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Profile from "./Profile";
import StudentDashboard from "./StudentDashboard";

function EvaluatorDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Evaluator Dashboard</h1>
      <div className="p-6 bg-slate-50 border border-slate-300 rounded-lg shadow-sm">
        <p className="text-slate-700 mb-4">Welcome. Start a new evaluation below.</p>
        <Link
          to="/start-evaluation"
          className="inline-block bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Start New Evaluation
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  switch (user.role) {
    case 'admin':
    case 'power_user':
      return <Profile />;
    case 'student':
      return <StudentDashboard />;
    case 'evaluator':
      return <EvaluatorDashboard />;
    default:
      return <div className="p-6 text-center text-red-600">Unknown user role.</div>;
  }
}
