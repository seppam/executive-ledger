import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ComingSoon from './pages/ComingSoon';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="insights" element={<ComingSoon />} />
          <Route path="budgets" element={<ComingSoon />} />
          <Route path="reports" element={<ComingSoon />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
