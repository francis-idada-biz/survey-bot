import { useState, useEffect } from "react";
import api from "../utils/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data.user ?? null);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []); // run ONCE only

  return { user, loading };
}
