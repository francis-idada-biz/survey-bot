import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    const token = localStorage.getItem("token");

    // 1. If no token exists, stop immediately. Don't call the API.
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // 2. Token exists, let's verify it
      const res = await api.get("/api/auth/me");
      setUser(res.data.user);
    } catch (err) {
      // 3. If the token is invalid (401), clear it automatically
      console.log("Session expired or invalid, clearing token.");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
}