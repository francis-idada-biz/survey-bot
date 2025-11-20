// src/components/StartEvaluation.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // Axios instance with auth token interceptor

export default function StartEvaluation() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Load students on mount
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await api.get("/api/users?role=student");
        setStudents(res.data.students || []);
      } catch (err) {
        setError("Failed to load students.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  // Start evaluation handler
  const startEvaluation = async () => {
    if (!selectedStudent) {
      setError("Please select a student.");
      return;
    }

    try {
      setStarting(true);
      setError("");

      // 1. Start evaluation
      const startRes = await api.post("/api/evaluations/start", {
        student_id: selectedStudent,
      });

      const { evaluation_id } = startRes.data;

      // 2. Immediately send __system_init
      await api.post("/api/evaluations/chat", {
        evaluation_id,
        message: "__system_init",
        history: [],
      });

      // 3. Navigate to evaluation chat
      navigate(`/evaluation/${evaluation_id}`);

    } catch (err) {
      console.error(err);
      setError("Could not start evaluation.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <div className="loading">Loading students...</div>;

  return (
    <div className="start-eval-container">
      <h2>Start New Evaluation</h2>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="student-select-section">
        <label>Select a student:</label>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Choose Student --</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.first_name} {s.last_name} ({s.email})
            </option>
          ))}
        </select>
      </div>

      <button
        className="start-btn"
        onClick={startEvaluation}
        disabled={starting}
      >
        {starting ? "Starting..." : "Start Evaluation"}
      </button>
    </div>
  );
}
