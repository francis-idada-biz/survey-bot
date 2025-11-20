import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function StartEvaluation() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      const res = await api.get("/api/users?role=student");
      setStudents(res.data.students || []);
      setLoading(false);
    }
    load();
  }, []);

  const start = async () => {
    const res = await api.post("/api/evaluations/start", {
      student_id: selected,
    });

    const evaluation_id = res.data.evaluation_id;

    await api.post("/api/evaluations/chat", {
      evaluation_id,
      message: "__system_init",
      history: [],
    });

    nav(`/evaluation/${evaluation_id}`);
  };

  if (loading) return <div className="p-6 text-slate-600">Loading…</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Start Evaluation</h2>

      <div className="p-6 bg-slate-50 border border-slate-300 rounded-lg shadow-sm space-y-4">
        <div>
          <label className="text-slate-700 font-medium">Select Student</label>
          <select
            className="w-full p-3 border border-slate-300 rounded-md mt-1 bg-white"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">-- Choose a student --</option>
            {students.map((s) => (
              <option key={s.user_id} value={s.user_id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>

        <button
          disabled={!selected}
          onClick={start}
          className="w-full bg-blue-700 disabled:bg-slate-400 text-white py-3 rounded-md hover:bg-blue-800"
        >
          Begin Evaluation
        </button>
      </div>
    </div>
  );
}
