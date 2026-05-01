import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API = import.meta.env.VITE_API_URL;

export default function Register() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Registration failed.'); return; }
      login(data.token, data.user);
      navigate('/');
    } catch {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-[2rem] p-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-manrope font-extrabold text-on-surface">Executive Ledger</h1>
          <p className="text-slate-500 font-inter text-sm mt-2">Create your account — free forever</p>
        </div>

        {error && (
          <div className="mb-5 px-5 py-3 bg-error-container text-on-error-container rounded-xl text-sm font-inter flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <input type="text" required placeholder="Alex Sterling" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-high rounded-2xl px-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
            <input type="email" required placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-high rounded-2xl px-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
            <input type="password" required placeholder="Min. 6 characters" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-high rounded-2xl px-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-manrope font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 font-inter mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
