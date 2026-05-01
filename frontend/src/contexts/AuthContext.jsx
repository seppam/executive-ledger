import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { setLoading(false); return; }
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setUser(data); else localStorage.removeItem('auth_token'); })
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem('auth_token', token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('auth_token');
    setUser(null);
  }

  function getHeaders() {
    const token = localStorage.getItem('auth_token');
    const apiKey = localStorage.getItem('expense_tracker_api_key');
    const headers = { 'Content-Type': 'application/json' };
    if (token)  headers['Authorization'] = `Bearer ${token}`;
    if (apiKey) headers['x-api-key']     = apiKey;
    return headers;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
