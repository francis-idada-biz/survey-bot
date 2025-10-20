// src/components/EvaluationChat.js
import { useState } from 'react';

export default function EvaluationChat() {
  const [evaluationId, setEvaluationId] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [evaluatorId, setEvaluatorId] = useState('');
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState('');

  const API_BASE = "http://localhost:4000/api/evaluations";

  async function startEvaluation() {
    const res = await fetch(`${API_BASE}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evaluator_id: evaluatorId, student_id: studentId })
    });
    const data = await res.json();
    setEvaluationId(data.evaluation_id);
    setHistory([]);
    setSummary('');
  }

  async function sendMessage() {
    if (!message.trim()) return;
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evaluation_id: evaluationId, message, history })
    });
    const data = await res.json();
    const botResponse = data.response;
    setHistory(prev => [...prev, { sender: 'user', text: message }, { sender: 'assistant', text: botResponse }]);
    setMessage('');
  }

  async function getSummary() {
    const res = await fetch(`${API_BASE}/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evaluation_id: evaluationId })
    });
    const data = await res.json();
    setSummary(data.summary);
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h2>Medical Student Evaluation</h2>

      {!evaluationId && (
        <div>
          <h4>Start Evaluation</h4>
          <input placeholder="Evaluator ID" value={evaluatorId} onChange={e => setEvaluatorId(e.target.value)} />
          <input placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />
          <button onClick={startEvaluation}>Start</button>
        </div>
      )}

      {evaluationId && (
        <>
          <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll", marginTop: "20px" }}>
            {history.map((msg, idx) => (
              <p key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                <strong>{msg.sender}:</strong> {msg.text}
              </p>
            ))}
          </div>

          <div style={{ marginTop: "10px" }}>
            <input
              style={{ width: "80%" }}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button onClick={getSummary}>Generate Summary</button>
          </div>
        </>
      )}

      {summary && (
        <div style={{ marginTop: "20px", padding: "15px", background: "#f0f2f5" }}>
          <h3>Evaluation Summary</h3>
          <pre>{summary}</pre>
        </div>
      )}
    </div>
  );
}
