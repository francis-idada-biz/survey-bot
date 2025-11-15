// src/components/EvaluationChat.js
import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function EvaluationChat() {
  const [evaluationId, setEvaluationId] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [message, setMessage] = useState("");
  const [displayHistory, setDisplayHistory] = useState([]); // [{sender, text}]
  const [llmHistory, setLlmHistory] = useState([]);         // [{role, content}]
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Load all students once
  useEffect(() => {
    (async () => {
      try {
        const list = await apiFetch("/api/users/students", { method: "GET" });
        setStudents(list);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  async function startEvaluation() {
    setError("");
    setSummary("");
    setDisplayHistory([]);
    setLlmHistory([]);

    if (!selectedStudent) {
      setError("Please select a student.");
      return;
    }
    try {
      const data = await apiFetch("/api/evaluations/start", {
        method: "POST",
        body: JSON.stringify({ student_id: Number(selectedStudent) }),
      });
      setEvaluationId(data.evaluation_id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function sendMessage() {
    if (!evaluationId) return setError("Start an evaluation first.");
    if (!message.trim()) return;
    setError("");
    setBusy(true);

    // Optimistic update
    setDisplayHistory(prev => [...prev, { sender: "user", text: message }]);
    const newLlmHistory = [...llmHistory, { role: "user", content: message }];

    try {
      const data = await apiFetch("/api/evaluations/chat", {
        method: "POST",
        body: JSON.stringify({
          evaluation_id: evaluationId,
          message,
          history: newLlmHistory,
        }),
      });

      setDisplayHistory(prev => [...prev, { sender: "assistant", text: data.response }]);
      setLlmHistory([...newLlmHistory, { role: "assistant", content: data.response }]);
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function getSummary() {
    if (!evaluationId) return;
    setError("");
    setBusy(true);
    try {
      const data = await apiFetch("/api/evaluations/summary", {
        method: "POST",
        body: JSON.stringify({ evaluation_id: evaluationId }),
      });
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h2>Evaluation Chat</h2>

      {!evaluationId && (
        <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <label>Select a student to evaluate</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">-- choose student --</option>
            {students.map(s => (
              <option key={s.user_id} value={s.user_id}>
                {s.name} {s.year_in_med_school ? `(Year ${s.year_in_med_school})` : ""} — {s.email}
              </option>
            ))}
          </select>
          <button onClick={startEvaluation}>Start Evaluation</button>
          {error && <p style={{ color: "crimson" }}>{error}</p>}
        </div>
      )}

      {evaluationId && (
        <>
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, height: 320, overflowY: "auto", marginTop: 16 }}>
            {displayHistory.map((m, i) => (
              <div key={i} style={{ textAlign: m.sender === "user" ? "right" : "left", margin: "6px 0" }}>
                <div style={{
                  display: "inline-block",
                  background: m.sender === "user" ? "#6b6be6" : "#f0f2f5",
                  color: m.sender === "user" ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: 12,
                  maxWidth: "75%"
                }}>
                  <strong>{m.sender === "user" ? "You" : "Assistant"}:</strong> {m.text}
                </div>
              </div>
            ))}
            {busy && <p style={{ fontStyle: "italic", color: "#666" }}>Claude is thinking…</p>}
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <input
              style={{ flex: 1 }}
              placeholder="Type your message…"
              value={message}
              onChange={e=>setMessage(e.target.value)}
              onKeyDown={e => (e.key === "Enter" ? sendMessage() : null)}
              disabled={busy}
            />
            <button onClick={sendMessage} disabled={busy}>Send</button>
            <button onClick={getSummary} disabled={busy}>Generate Summary</button>
          </div>

          {error && <p style={{ color: "crimson" }}>{error}</p>}

          {summary && (
            <div style={{ background: "#f7f7fb", border: "1px solid #e5e5f0", borderRadius: 8, padding: 12, marginTop: 16 }}>
              <h3>Summary</h3>
              <pre style={{ whiteSpace: "pre-wrap" }}>{summary}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
