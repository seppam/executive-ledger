import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Demo user — auto-signed in
const DEMO_USER = {
  id: 'demo-user-001',
  name: 'Alex Sterling',
  email: 'alex@example.com',
  role: 'owner',
};

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always auto-login in demo mode (no backend needed)
    setUser(DEMO_USER);
    setLoading(false);
  }, []);

  function login(_token, userData) {
    // In demo mode, just set the demo user
    setUser(userData || DEMO_USER);
  }

  function logout() {
    setUser(null);
  }

  function getHeaders() {
    const apiKey = localStorage.getItem('expense_tracker_api_key');
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['x-api-key'] = apiKey;
    return headers;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
