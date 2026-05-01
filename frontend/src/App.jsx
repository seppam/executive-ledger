import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AcceptInvite from './pages/AcceptInvite';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import ComingSoon from './pages/ComingSoon';
import './index.css';

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"          element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register"       element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* Protected */}
      <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
        <Route index element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<ComingSoon title="Profile" desc="Your profile coming soon." />} />
        <Route path="budgets" element={<ComingSoon title="Budgets" desc="Full budget management coming soon." />} />
        <Route path="reports" element={<ComingSoon title="Reports" desc="Advanced reports coming soon." />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
