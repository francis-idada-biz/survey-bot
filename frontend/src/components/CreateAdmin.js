// src/components/CreateAdmin.js
import { useState } from "react";
import { apiFetch } from "../api";

export default function CreateAdmin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      const data = await apiFetch("/api/users/create-admin", {
        method: "POST",
        body: JSON.stringify({ name, email }),
      });
      setMsg(`✅ Admin created: ${data.name} (${data.email})`);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2>Create Admin (Power User)</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        <input type="email" placeholder="admin@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      {msg && <p style={{ color: msg.startsWith("✅") ? "green" : "crimson" }}>{msg}</p>}
    </div>
  );
}
