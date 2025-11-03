// src/components/Register.js
import { useMemo, useState } from "react";
import { API_BASE } from "../api";

export default function Register() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get("token");

  const [name, setName] = useState("");
  const [year, setYear] = useState("");             // students (optional)
  const [department, setDepartment] = useState(""); // evaluators (optional)
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!token) return setMsg("❌ Missing or invalid invitation link (no token).");
    if (!name || !password) return setMsg("❌ Name and password are required.");
    if (password !== confirm) return setMsg("❌ Passwords do not match.");

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name,
          // backend will ignore irrelevant fields depending on the role embedded in the invite
          year_in_med_school: year ? Number(year) : null,
          department: department || null,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Registration failed");

      setMsg("✅ Registration successful. You can now sign in.");
      // setTimeout(() => (window.location.href = "/"), 1500);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "2rem auto" }}>
      <h2>Complete Registration</h2>
      <p style={{ color: "#666", marginBottom: 12 }}>
        This page uses your invitation token to apply your email and role securely.
      </p>

      {!token && <p style={{ color: "crimson" }}>Missing token. Please open the link from your invitation email.</p>}
      {msg && <p style={{ color: msg.startsWith("✅") ? "green" : "crimson" }}>{msg}</p>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }} autoComplete="off">
        <input
          name="full-name"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
          required
          autoComplete="name"
        />

        {/* Student-only (safe to show; backend ignores for non-students) */}
        <label style={{ fontSize: 12, color: "#666" }}>
          If you’re a student, fill your year:
        </label>
        <input
          name="student-year"
          placeholder="Year in medical school (e.g., 3)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          disabled={busy}
          inputMode="numeric"
          autoComplete="off"
        />

        {/* Evaluator-only (ignored for non-evaluators) */}
        <label style={{ fontSize: 12, color: "#666" }}>
          If you’re an evaluator, fill your department:
        </label>
        <input
          name="evaluator-department"
          placeholder="Department (e.g., Emergency Medicine)"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          disabled={busy}
          autoComplete="off"
        />

        <input
          name="new-password"
          type="password"
          placeholder="Create password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          required
          autoComplete="new-password"
        />
        <input
          name="confirm-password"
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={busy}
          required
          autoComplete="new-password"
        />

        <button type="submit" disabled={busy || !token}>
          {busy ? "Submitting…" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
