// src/App.js
import { useState } from "react";
import Login from "./components/Login";
import EvaluationChat from "./components/EvaluationChat";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

  function handleLogin(newRole) {
    setRole(newRole);
  }

  function logout() {
    localStorage.clear();
    setRole(null);
  }

  return (
    <div>
      {!role ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <p>Logged in as {role} <button onClick={logout}>Logout</button></p>
          <EvaluationChat />
        </>
      )}
    </div>
  );
}

export default App;
