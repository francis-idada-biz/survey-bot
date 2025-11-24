import React, { useState, useEffect, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function EvaluationChat() {
  const { evaluation_id } = useParams();
  const nav = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryShown, setSummaryShown] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const res = await api.get(`/api/evaluations/chat/${evaluation_id}`);
    const fetchedMessages = res.data.messages || [];
    setMessages(
      fetchedMessages.map((m) => ({ role: m.sender, message: m.content }))
    );
    setLoading(false);
    scrollDown();
  };

  const scrollDown = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    const currentInput = input;
    const userMessage = { role: "user", message: currentInput };

    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);
    scrollDown();

    try {
      const res = await api.post("/api/evaluations/chat", {
        evaluation_id,
        message: currentInput,
        history: messages,
      });

      const assistantMessage = { role: "assistant", message: res.data.response };
      setMessages((m) => [...m, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((m) => m.slice(0, -1)); // remove optimistic message
      setInput(currentInput); // restore input
    } finally {
      setLoading(false);
      scrollDown();
    }
  };

  const generateSummary = async () => {
    setIsSummarizing(true);
    try {
      const res = await api.post("/api/evaluations/summary", { evaluation_id });
      setSummary(res.data.summary);
      setSummaryShown(true);
    } catch (error) {
      console.error("Failed to generate summary", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">Evaluation Chat</h2>
        <div className="flex gap-2">
          <button
            onClick={generateSummary}
            disabled={isSummarizing || summaryShown}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-slate-400"
          >
            {isSummarizing ? "Generating..." : "Generate Summary"}
          </button>
          <button
            onClick={() => nav("/")}
            className="bg-slate-200 text-slate-800 px-4 py-2 rounded-md hover:bg-slate-300"
          >
            Save and Exit
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 shadow-sm h-[65vh] overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[75%] whitespace-pre-wrap ${
              msg.role === "assistant"
                ? "bg-white border border-slate-300 text-slate-800"
                : "bg-blue-700 text-white ml-auto"
            }`}
          >
            {msg.message}
          </div>
        ))}
        {loading && (
          <div className="p-3 rounded-lg max-w-[75%] whitespace-pre-wrap bg-white border border-slate-300 text-slate-800">
            <span className="animate-blink">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        )}
        {summaryShown && (
          <div className="p-4 bg-yellow-100 border-t-2 border-yellow-500">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Summary & Recommendation</h3>
            <p className="whitespace-pre-wrap text-slate-700">{summary}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {summaryShown ? (
        <div className="flex justify-end">
          <button
            onClick={() => nav("/")}
            className="bg-blue-700 text-white px-5 py-3 rounded-md hover:bg-blue-800"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <TextareaAutosize
            minRows={1}
            className="flex-1 border border-slate-300 rounded-md p-3 resize-none"
            placeholder="Type your response..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />

          <button
            onClick={send}
            disabled={loading}
            className="bg-blue-700 text-white px-5 py-3 rounded-md hover:bg-blue-800 disabled:bg-blue-400"
          >
            {loading ? (
              <span className="animate-blink">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            ) : (
              "Send"
            )}
          </button>
        </div>
      )}
    </div>
  );
}