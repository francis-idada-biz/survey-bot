// src/App.js
import { useEffect, useState } from "react";
import Login from "./components/Login";
import EvaluationChat from "./components/EvaluationChat";
import InviteUser from "./components/InviteUser";
import Register from "./components/Register";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [view, setView] = useState("home");

  // naive routing: show Register when path is /register
  const isRegisterPage = window.location.pathname === "/register";

  useEffect(() => {
    setView("home");
  }, [role]);

  function handleLogin(dataOrRole) {
    const newRole = typeof dataOrRole === "string" ? dataOrRole : dataOrRole?.role;
    localStorage.setItem("role", newRole);
    setRole(newRole);
  }

  function logout() {
    localStorage.clear();
    setRole(null);
    setView("home");
  }

  // Public registration page (from invite link ?token=...)
  if (isRegisterPage) {
    return <Register />;
  }

  // Not logged in -> show login
  if (!role) {
    return (
      <div style={{ padding: "2rem" }}>
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // Logged in -> role-based simple nav
  return (
    <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><strong>Logged in as:</strong> {role}</div>
        <div style={{ display: "flex", gap: 8 }}>
          {(role === "evaluator" || role === "admin") && (
            <button onClick={() => setView("evaluate")}>Evaluate</button>
          )}
          {role === "admin" && (
            <button onClick={() => setView("invite")}>Invite Users</button>
          )}
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main style={{ marginTop: 16 }}>
        {view === "home" && <p>Select an action above.</p>}
        {view === "evaluate" && <EvaluationChat />}
        {view === "invite" && role === "admin" && <InviteUser />}
      </main>
    </div>
  );
}

export default App;
