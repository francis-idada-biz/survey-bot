// src/App.js
import { useEffect, useState } from "react";
import Login from "./components/Login";
import EvaluationChat from "./components/EvaluationChat";
import InviteUser from "./components/InviteUser";
// (Optional) If you build a CreateAdmin form for the power user:
// import CreateAdmin from "./components/CreateAdmin";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [view, setView] = useState("home"); // 'home' | 'evaluate' | 'invite' | 'create-admin'

  useEffect(() => {
    // If role changes (login/logout), reset to home
    setView("home");
  }, [role]);

  function handleLogin(dataOrRole) {
    // called by <Login onLogin={...}/>
    const newRole = typeof dataOrRole === "string" ? dataOrRole : dataOrRole?.role;
    localStorage.setItem("role", newRole);
    setRole(newRole);
  }

  function logout() {
    localStorage.clear();
    setRole(null);
    setView("home");
  }

  if (!role) {
    return (
      <div style={{ padding: "2rem" }}>
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <strong>Logged in as:</strong> {role}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Show tabs based on role */}
          {(role === "evaluator" || role === "admin") && (
            <button onClick={() => setView("evaluate")}>Evaluate</button>
          )}
          {role === "admin" && (
            <button onClick={() => setView("invite")}>Invite Users</button>
          )}
          {/* If you support a power_user dashboard, uncomment: */}
          {/* {role === "power_user" && (
            <button onClick={() => setView("create-admin")}>Create Admin</button>
          )} */}
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main style={{ marginTop: 16 }}>
        {view === "home" && (
          <div>
            <h2>Welcome</h2>
            <p>Select an action above.</p>
          </div>
        )}

        {view === "evaluate" && (
          <EvaluationChat />
        )}

        {view === "invite" && role === "admin" && (
          <InviteUser />
        )}

        {/* If you build CreateAdmin later:
        {view === "create-admin" && role === "power_user" && (
          <CreateAdmin />
        )} */}
      </main>
    </div>
  );
}

export default App;
