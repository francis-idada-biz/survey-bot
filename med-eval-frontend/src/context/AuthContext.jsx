import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to check if the user is logged in (calls backend)
  const checkUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data.user);
    } catch (err) {
      console.error("Auth check failed", err);
      setUser(null);
      // Optional: Clear invalid token
      // localStorage.removeItem("token"); 
    } finally {
      setLoading(false);
    }
  };

  // Check user on app load
  useEffect(() => {
    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
}