import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API = import.meta.env.VITE_API_URL;

export default function AcceptInvite() {
  const [params]  = useSearchParams();
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const token     = params.get('token');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [inviteInfo, setInviteInfo] = useState(null);

  useEffect(() => {
    if (!token) { setError('Invalid invitation link.'); setVerifying(false); return; }
    // Try to read invite info from the token
    fetch(`${API}/api/auth/accept?token=${token}`, { method: 'OPTIONS' })
      .catch(() => {})
      .finally(() => setVerifying(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to accept invitation.'); return; }
      login(data.token, data.user);
      navigate('/');
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-[2rem] p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">person_add</span>
          </div>
          <h1 className="text-2xl font-manrope font-extrabold text-on-surface">You're Invited!</h1>
          <p className="text-slate-500 font-inter text-sm mt-2">
            Create your account to join the team
          </p>
        </div>

        {error && (
          <div className="mb-5 px-5 py-3 bg-error-container text-on-error-container rounded-xl text-sm font-inter flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Your Name</label>
            <input type="text" required placeholder="Alex Sterling" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-high rounded-2xl px-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-inter font-bold uppercase tracking-widest text-slate-400 ml-1">Set Password</label>
            <input type="password" required placeholder="Min. 6 characters" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-high rounded-2xl px-5 py-4 text-sm font-inter text-on-surface border-none focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-manrope font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span> : null}
            {loading ? 'Joining…' : 'Join Team'}
          </button>
        </form>
      </div>
    </div>
  );
}
