// src/api.js
export const API_BASE = "http://localhost:4000";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Attempt to parse JSON always (backend returns JSON)
  let data;
  try {
    data = await res.json();
  } catch {
    data = { error: "Invalid JSON from server" };
  }

  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    // auth failures — log out client-side
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
    throw new Error(msg);
  }

  return data;
}
