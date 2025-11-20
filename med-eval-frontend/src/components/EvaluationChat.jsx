import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

export default function EvaluationChat() {
  const { evaluation_id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get(`/api/evaluations/chat/${evaluation_id}`);
    setMessages(res.data.messages || []);
    scrollDown();
  };

  const scrollDown = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const send = async () => {
    if (!input.trim()) return;

    const res = await api.post("/api/evaluations/chat", {
      evaluation_id,
      message: input,
    });

    setMessages((m) => [
      ...m,
      { role: "user", message: input },
      res.data.message,
    ]);

    setInput("");
    scrollDown();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Evaluation Chat</h2>

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
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border border-slate-300 rounded-md p-3"
          placeholder="Type your response..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={send}
          className="bg-blue-700 text-white px-5 py-3 rounded-md hover:bg-blue-800"
        >
          Send
        </button>
      </div>
    </div>
  );
}
