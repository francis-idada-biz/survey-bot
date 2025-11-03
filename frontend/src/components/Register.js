// src/components/Register.js
import { useMemo, useState } from "react";
import { API_BASE } from "../api";

export default function Register() {
  // Read invite token from URL: /register?token=XXXX
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get("token");

  // Form state
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");               // students (optional if not student)
  const [year, setYear] = useState("");             // students (optional if not student)
  const [department, setDepartment] = useState(""); // evaluators (optional if not evaluator)
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!token) {
      setMsg("❌ Missing or invalid invitation link (no token).");
      return;
    }
    if (!name || !password) {
      setMsg("❌ Name and password are required.");
      return;
    }
    if (password !== confirm) {
      setMsg("❌ Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name,
          dob: dob || null,
          year_in_med_school: year ? Number(year) : null,
          department: department || null,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Registration failed");
      }

      setMsg("✅ Registration successful. You can now sign in.");
      // Optional: redirect to home/login after a short delay
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

      {!token && (
        <p style={{ color: "crimson" }}>
          Missing token. Please open the link from your invitation email.
        </p>
      )}

      {msg && (
        <p style={{ color: msg.startsWith("✅") ? "green" : "crimson" }}>{msg}</p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
          required
        />

        {/* Student-only (safe to show; backend ignores if role ≠ student) */}
        <label style={{ fontSize: 12, color: "#666" }}>
          If you’re a student, fill these:
        </label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          disabled={busy}
        />
        <input
          placeholder="Year in medical school (e.g., 3)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          disabled={busy}
          inputMode="numeric"
        />

        {/* Evaluator-only (backend ignores if role ≠ evaluator) */}
        <label style={{ fontSize: 12, color: "#666" }}>
          If you’re an evaluator, fill this:
        </label>
        <input
          placeholder="Department (e.g., Emergency Medicine)"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          disabled={busy}
        />

        <input
          type="password"
          placeholder="Create password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={busy}
          required
        />

        <button type="submit" disabled={busy || !token}>
          {busy ? "Submitting…" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
// src/components/Register.js
import { useMemo, useState } from "react";
import { API_BASE } from "../api";

export default function Register() {
  // Read invite token from URL: /register?token=XXXX
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get("token");

  // Form state
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");               // students (optional if not student)
  const [year, setYear] = useState("");             // students (optional if not student)
  const [department, setDepartment] = useState(""); // evaluators (optional if not evaluator)
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!token) {
      setMsg("❌ Missing or invalid invitation link (no token).");
      return;
    }
    if (!name || !password) {
      setMsg("❌ Name and password are required.");
      return;
    }
    if (password !== confirm) {
      setMsg("❌ Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name,
          dob: dob || null,
          year_in_med_school: year ? Number(year) : null,
          department: department || null,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Registration failed");
      }

      setMsg("✅ Registration successful. You can now sign in.");
      // Optional: redirect to home/login after a short delay
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

      {!token && (
        <p style={{ color: "crimson" }}>
          Missing token. Please open the link from your invitation email.
        </p>
      )}

      {msg && (
        <p style={{ color: msg.startsWith("✅") ? "green" : "crimson" }}>{msg}</p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
          required
        />

        {/* Student-only (safe to show; backend ignores if role ≠ student) */}
        <label style={{ fontSize: 12, color: "#666" }}>
          If you’re a student, fill these:
        </label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          disabled={busy}
        />
        <input
          placeholder="Year in medical school (e.g., 3)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          disabled={busy}
          inputMode="numeric"
        />

        {/* Evaluator-only (backend ignores if role ≠ evaluator) */}
        <label style={{ fontSize: 12, color: "#666" }}>
          If you’re an evaluator, fill this:
        </label>
        <input
          placeholder="Department (e.g., Emergency Medicine)"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          disabled={busy}
        />

        <input
          type="password"
          placeholder="Create password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={busy}
          required
        />

        <button type="submit" disabled={busy || !token}>
          {busy ? "Submitting…" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
