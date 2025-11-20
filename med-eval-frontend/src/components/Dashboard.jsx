import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
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
