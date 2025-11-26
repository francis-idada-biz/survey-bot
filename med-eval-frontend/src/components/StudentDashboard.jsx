import React, { useState, useEffect } from "react";
import api from "../utils/api";

export default function StudentDashboard() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await api.get("/api/evaluations/student");
        setEvaluations(res.data);
      } catch (err) {
        setError("Failed to fetch evaluations.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

  const toggleSummary = (evaluationId) => {
    if (expandedSummary === evaluationId) {
      setExpandedSummary(null);
    } else {
      setExpandedSummary(evaluationId);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading evaluations...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">My Evaluations</h1>
      {evaluations.length === 0 ? (
        <div className="p-6 bg-slate-50 border border-slate-300 rounded-lg shadow-sm">
          <p className="text-slate-700">You have no evaluations yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <div key={evaluation.evaluation_id} className="p-4 bg-white border border-slate-300 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{evaluation.evaluator_name}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(evaluation.started_at).toLocaleDateString()} - 
                    <span className={`ml-2 font-medium ${evaluation.completed_at ? 'text-green-600' : 'text-yellow-600'}`}>
                      {evaluation.completed_at ? "Completed" : "In Progress"}
                    </span>
                  </p>
                </div>
                {evaluation.summary && (
                  <button
                    onClick={() => toggleSummary(evaluation.evaluation_id)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {expandedSummary === evaluation.evaluation_id ? "Hide Summary" : "View Summary"}
                  </button>
                )}
              </div>
              {expandedSummary === evaluation.evaluation_id && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h3 className="font-semibold mb-2">Summary & Recommendation</h3>
                  <p className="whitespace-pre-wrap text-slate-700">{evaluation.summary}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
