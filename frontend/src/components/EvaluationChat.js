// src/components/EvaluationChat.js
import { useState } from "react";
import { apiFetch } from "../api";

export default function EvaluationChat() {
  const [evaluationId, setEvaluationId] = useState(null);
  const [evaluatorId, setEvaluatorId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState("");
  const [displayHistory, setDisplayHistory] = useState([]); // [{sender, text}]
  const [llmHistory, setLlmHistory] = useState([]);         // [{role:'user'|'assistant', content:'...'}]
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startEvaluation() {
    setError("");
    setSummary("");
    setDisplayHistory([]);
    setLlmHistory([]);
    if (!evaluatorId || !studentId) {
      setError("Evaluator ID and Student ID are required.");
      return;
    }
    try {
      const data = await apiFetch("/api/evaluations/start", {
        method: "POST",
        body: JSON.stringify({ evaluator_id: Number(evaluatorId), student_id: Number(studentId) }),
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

    // Optimistic UI update
    setDisplayHistory(prev => [...prev, { sender: "user", text: message }]);
    const newLlmHistory = [...llmHistory, { role: "user", content: message }];

    try {
      const data = await apiFetch("/api/evaluations/chat", {
        method: "POST",
        body: JSON.stringify({
          evaluation_id: evaluationId,
          message,
          history: newLlmHistory, // 👈 backend expects Anthropic-style messages
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
          <input
            placeholder="Evaluator ID (users.user_id)"
            value={evaluatorId}
            onChange={e=>setEvaluatorId(e.target.value)}
          />
          <input
            placeholder="Student ID (users.user_id)"
            value={studentId}
            onChange={e=>setStudentId(e.target.value)}
          />
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
