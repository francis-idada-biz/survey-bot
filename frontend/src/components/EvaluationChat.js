// src/components/EvaluationChat.js
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../api";

export default function EvaluationChat({ evaluation_id, studentName }) {
  const [messages, setMessages] = useState([]);   // {sender: "user"/"assistant", text}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const bottomRef = useRef(null);

  // --------------------------
  // SCROLL TO BOTTOM ON UPDATE
  // --------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, summary]);

  // --------------------------
  // INIT: SEND __system_init
  // --------------------------
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const r = await apiFetch("/api/evaluations/chat", {
          method: "POST",
          body: JSON.stringify({
            evaluation_id,
            message: "__system_init",
            history: []
          }),
        });

        setMessages((m) => [...m, { sender: "assistant", text: r.response }]);
      } catch (e) {
        console.error(e);
        setMessages((m) => [
          ...m,
          { sender: "assistant", text: "Error initializing evaluation." },
        ]);
      }
      setLoading(false);
    }

    if (evaluation_id) init();
  }, [evaluation_id]);

  // --------------------------
  // SEND MESSAGE
  // --------------------------
  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");

    // Add message locally
    setMessages((m) => [...m, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const historyForAPI = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const r = await apiFetch("/api/evaluations/chat", {
        method: "POST",
        body: JSON.stringify({
          evaluation_id,
          message: userMsg,
          history: historyForAPI,
        }),
      });

      setMessages((m) => [...m, { sender: "assistant", text: r.response }]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        { sender: "assistant", text: "Error sending message." },
      ]);
    }

    setLoading(false);
  }

  // --------------------------
  // GENERATE SUMMARY
  // --------------------------
  async function generateSummary() {
    if (loading) return;

    setLoading(true);
    try {
      const r = await apiFetch("/api/evaluations/summary", {
        method: "POST",
        body: JSON.stringify({ evaluation_id }),
      });
      setSummary(r.summary);
    } catch (e) {
      console.error(e);
      setSummary("Error generating summary.");
    }
    setLoading(false);
  }

  // --------------------------
  // RENDER
  // --------------------------
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Evaluating {studentName}</h2>

      {/* CHAT WINDOW */}
      <div style={styles.chatWindow}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(m.sender === "user" ? styles.userBubble : styles.assistantBubble),
              }}
            >
              <div style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ fontStyle: "italic", color: "#666" }}>
            Claude is thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div style={styles.inputRow}>
        <textarea
          style={styles.input}
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
        />
        <button style={styles.sendBtn} onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>

      {/* SUMMARY BUTTON */}
      {!summary && (
        <button style={styles.summaryBtn} onClick={generateSummary} disabled={loading}>
          Generate Summary
        </button>
      )}

      {/* SUMMARY DISPLAY */}
      {summary && (
        <div style={styles.summaryBox}>
          <h3>Final Summary</h3>
          <div style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}>
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}


// ---------------------------------------
// STYLES
// ---------------------------------------
const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "15px",
  },
  chatWindow: {
    height: "60vh",
    overflowY: "auto",
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "8px",
    background: "#fafafa",
  },
  bubble: {
    maxWidth: "70%",
    padding: "12px",
    borderRadius: "12px",
    lineHeight: 1.4,
  },
  userBubble: {
    background: "#cce5ff",
    border: "1px solid #99caff",
  },
  assistantBubble: {
    background: "#fff",
    border: "1px solid #ddd",
  },
  inputRow: {
    display: "flex",
    marginTop: "15px",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  sendBtn: {
    padding: "10px 16px",
    background: "#0069d9",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  summaryBtn: {
    marginTop: "15px",
    padding: "10px 20px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },
  summaryBox: {
    marginTop: "20px",
    padding: "15px",
    background: "#fefefe",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
};
