// src/components/InviteUser.js
import { useState } from "react";
import { apiFetch } from "../api";

export default function InviteUser() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setResult("");
    setError("");
    try {
      const data = await apiFetch("/api/users/invite", {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
      // In dev we just display the token. In prod you'd email them this link.
      setResult(
        `✅ Invitation created. Registration link: http://localhost:3000/register?token=${data.token}`
      );
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2>Invite User</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
        />
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="evaluator">Evaluator</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Send Invite</button>
      </form>
      {result && <p style={{ color: "green" }}>{result}</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}
